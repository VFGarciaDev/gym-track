import type { ReactTestRenderer } from "react-test-renderer"

import { createElement } from "react"
import { act, create } from "react-test-renderer"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const dependencies = vi.hoisted(() => ({
  checkForUpdateAsync: vi.fn(),
  downloadProgress: 0,
  fetchUpdateAsync: vi.fn(),
  hideAsync: vi.fn(),
  isEnabled: true,
  preventAutoHideAsync: vi.fn(),
  reloadAsync: vi.fn(),
  setOptions: vi.fn()
}))

vi.mock("expo-splash-screen", () => ({
  hideAsync: dependencies.hideAsync,
  preventAutoHideAsync: dependencies.preventAutoHideAsync,
  setOptions: dependencies.setOptions
}))

vi.mock("expo-updates", () => ({
  checkForUpdateAsync: dependencies.checkForUpdateAsync,
  fetchUpdateAsync: dependencies.fetchUpdateAsync,
  get isEnabled() {
    return dependencies.isEnabled
  },
  reloadAsync: dependencies.reloadAsync,
  useUpdates: () => ({ downloadProgress: dependencies.downloadProgress })
}))

type HookResult = {
  continueWithInstalledVersion: () => void
  error: string | null
  hideNativeSplash: () => void
  phase: "checking" | "downloading" | "restarting" | "failed" | "ready"
  progress: number
  retry: () => void
  secondsUntilContinue: number
}

type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T) => void
}

function createDeferred<T>(): Deferred<T> {
  let resolvePromise: ((value: T) => void) | undefined
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve
  })

  return {
    promise,
    resolve: (value) => resolvePromise?.(value)
  }
}

async function renderOTAUpdateHook() {
  const { useOTAUpdate } = await import("./index")
  let currentResult: HookResult | undefined
  let renderer: ReactTestRenderer | undefined

  function Harness() {
    currentResult = useOTAUpdate()
    return null
  }

  await act(async () => {
    renderer = create(createElement(Harness))
  })

  return {
    get result() {
      if (!currentResult) throw new Error("Hook result is not available")
      return currentResult
    },
    unmount: async () => {
      await act(async () => {
        renderer?.unmount()
      })
    }
  }
}

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.stubGlobal("__DEV__", false)
  vi.stubEnv("EXPO_PUBLIC_OTA_MOCK_SCENARIO", "")
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)

  dependencies.downloadProgress = 0
  dependencies.isEnabled = true
  dependencies.preventAutoHideAsync.mockResolvedValue(true)
  dependencies.hideAsync.mockResolvedValue(undefined)
  dependencies.checkForUpdateAsync.mockResolvedValue({
    isAvailable: false,
    isRollBackToEmbedded: false
  })
  dependencies.fetchUpdateAsync.mockResolvedValue({
    isNew: false,
    isRollBackToEmbedded: false
  })
  dependencies.reloadAsync.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("use OTA update", () => {
  it("starts one update check and continues when no update is available", async () => {
    const hook = await renderOTAUpdateHook()

    expect(dependencies.checkForUpdateAsync).toHaveBeenCalledOnce()
    expect(dependencies.fetchUpdateAsync).not.toHaveBeenCalled()
    expect(hook.result.phase).toBe("ready")

    await hook.unmount()
  })

  it("continues without checking when updates are disabled", async () => {
    dependencies.isEnabled = false

    const hook = await renderOTAUpdateHook()

    expect(dependencies.checkForUpdateAsync).not.toHaveBeenCalled()
    expect(hook.result.phase).toBe("ready")

    await hook.unmount()
  })

  it("downloads an available update, reports progress, and reloads", async () => {
    const fetchedUpdate = createDeferred<{ isNew: boolean; isRollBackToEmbedded: boolean }>()
    dependencies.downloadProgress = 0.42
    dependencies.checkForUpdateAsync.mockResolvedValue({
      isAvailable: true,
      isRollBackToEmbedded: false
    })
    dependencies.fetchUpdateAsync.mockReturnValue(fetchedUpdate.promise)

    const hook = await renderOTAUpdateHook()

    expect(hook.result.phase).toBe("downloading")
    expect(hook.result.progress).toBe(42)

    await act(async () => {
      fetchedUpdate.resolve({ isNew: true, isRollBackToEmbedded: false })
    })

    expect(dependencies.reloadAsync).toHaveBeenCalledOnce()
    expect(hook.result.phase).toBe("restarting")

    await hook.unmount()
  })

  it("counts down after a failure and continues automatically", async () => {
    vi.useFakeTimers()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    dependencies.checkForUpdateAsync.mockRejectedValue(new Error("offline"))

    const hook = await renderOTAUpdateHook()

    expect(hook.result.phase).toBe("failed")
    expect(hook.result.secondsUntilContinue).toBe(30)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(hook.result.secondsUntilContinue).toBe(29)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(29_000)
    })
    expect(hook.result.phase).toBe("ready")

    await hook.unmount()
  })

  it("does not apply an older attempt after retrying", async () => {
    const firstCheck = createDeferred<{ isAvailable: boolean; isRollBackToEmbedded: boolean }>()
    dependencies.checkForUpdateAsync
      .mockReturnValueOnce(firstCheck.promise)
      .mockResolvedValueOnce({ isAvailable: false, isRollBackToEmbedded: false })

    const hook = await renderOTAUpdateHook()

    await act(async () => {
      hook.result.retry()
    })
    expect(hook.result.phase).toBe("ready")

    await act(async () => {
      firstCheck.resolve({ isAvailable: true, isRollBackToEmbedded: false })
    })

    expect(dependencies.fetchUpdateAsync).not.toHaveBeenCalled()
    expect(dependencies.reloadAsync).not.toHaveBeenCalled()

    await hook.unmount()
  })

  it("retries hiding the splash after the first call fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    dependencies.hideAsync
      .mockRejectedValueOnce(new Error("splash unavailable"))
      .mockResolvedValueOnce(undefined)
    const hook = await renderOTAUpdateHook()

    await act(async () => {
      hook.result.hideNativeSplash()
      await Promise.resolve()
    })
    await act(async () => {
      hook.result.hideNativeSplash()
      await Promise.resolve()
    })

    expect(dependencies.hideAsync).toHaveBeenCalledTimes(2)

    await hook.unmount()
  })

  it("hides the splash only once after a successful call", async () => {
    const hook = await renderOTAUpdateHook()

    await act(async () => {
      hook.result.hideNativeSplash()
      await Promise.resolve()
    })
    hook.result.hideNativeSplash()

    expect(dependencies.hideAsync).toHaveBeenCalledOnce()

    await hook.unmount()
  })
})
