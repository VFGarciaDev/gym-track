import type { UserSession } from "@/types/user-session"
import type { ReactElement } from "react"

import { beforeEach, describe, expect, it, vi } from "vitest"

import AuthProvider from "./AuthContext"

const dependencies = vi.hoisted(() => ({
  fetchUserSession: vi.fn(),
  useUserSession: vi.fn(),
  waitForUserSessionHydration: vi.fn()
}))

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>()

  return {
    ...react,
    useCallback: <T extends (...args: never[]) => unknown>(callback: T) => callback,
    useMemo: <T>(factory: () => T) => factory(),
    useRef: <T>(initialValue: T) => ({ current: initialValue })
  }
})
vi.mock("@/api/auth/fetch-user-session", () => ({
  fetchUserSession: dependencies.fetchUserSession
}))
vi.mock("@/store/user-session", () => ({
  useUserSession: dependencies.useUserSession,
  waitForUserSessionHydration: dependencies.waitForUserSessionHydration
}))

const credentials = { username: "user", password: "password" }
const session: UserSession = {
  user: { name: "User", email: "user@example.com", taxId: "12345678900" }
}

type ContextValue = {
  isAuthenticated: boolean | undefined
  signIn: (value: typeof credentials) => Promise<void>
  signOut: () => Promise<void>
}

type StoreState = {
  hasHydrated: boolean
  user: UserSession["user"] | null
  setSession: (value: UserSession) => void
  clearSession: () => Promise<void>
}

function renderAuthProvider(state: StoreState) {
  dependencies.useUserSession.mockImplementation((selector: (value: StoreState) => unknown) =>
    selector(state)
  )

  const provider = AuthProvider({ children: null }) as ReactElement<{ value: ContextValue }>

  return provider.props.value
}

function createStoreState(overrides: Partial<StoreState> = {}): StoreState {
  return {
    hasHydrated: true,
    user: null,
    setSession: vi.fn(),
    clearSession: vi.fn().mockResolvedValue(undefined),
    ...overrides
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  dependencies.waitForUserSessionHydration.mockResolvedValue(undefined)
})

describe("auth provider", () => {
  it("keeps authentication unresolved before session hydration", () => {
    const context = renderAuthProvider(createStoreState({ hasHydrated: false, user: session.user }))

    expect(context.isAuthenticated).toBeUndefined()
  })

  it("authenticates a hydrated session that has a user", () => {
    const context = renderAuthProvider(createStoreState({ user: session.user }))

    expect(context.isAuthenticated).toBe(true)
  })

  it("rejects a hydrated session without a user", () => {
    const context = renderAuthProvider(createStoreState())

    expect(context.isAuthenticated).toBe(false)
  })

  it("waits for hydration and persists a successful sign in", async () => {
    const events: string[] = []
    const state = createStoreState({
      setSession: () => {
        events.push("persisted")
      }
    })
    dependencies.waitForUserSessionHydration.mockImplementation(async () => {
      events.push("hydrated")
    })
    dependencies.fetchUserSession.mockImplementation(async () => {
      events.push("fetched")
      return session
    })

    await renderAuthProvider(state).signIn(credentials)

    expect(events).toEqual(["hydrated", "fetched", "persisted"])
  })

  it("waits for hydration and removes the persisted session on sign out", async () => {
    const events: string[] = []
    const state = createStoreState({
      clearSession: async () => {
        events.push("cleared")
      }
    })
    dependencies.waitForUserSessionHydration.mockImplementation(async () => {
      events.push("hydrated")
    })

    await renderAuthProvider(state).signOut()

    expect(events).toEqual(["hydrated", "cleared"])
  })

  it("does not restore a pending sign in after a newer sign out", async () => {
    let resolveSession: ((value: UserSession) => void) | undefined
    const pendingSession = new Promise<UserSession>((resolve) => {
      resolveSession = resolve
    })
    const persistedSessions: UserSession[] = []
    let clearCount = 0
    const context = renderAuthProvider(
      createStoreState({
        setSession: (value) => {
          persistedSessions.push(value)
        },
        clearSession: async () => {
          clearCount += 1
        }
      })
    )
    dependencies.fetchUserSession.mockReturnValue(pendingSession)

    const signIn = context.signIn(credentials)
    await context.signOut()
    resolveSession?.(session)
    await signIn

    expect(clearCount).toBe(1)
    expect(persistedSessions).toEqual([])
  })
})
