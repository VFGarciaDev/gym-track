import { assert, expect, it } from "vitest"

import { resolveOTAMockScenario, runMockOTAUpdateAttempt } from "./ota-update-mock"
import { runOTAUpdateAttempt } from "./ota-update-runner"
import { initialOTAUpdateState, otaUpdateReducer, toProgressPercentage } from "./ota-update-state"

it("moves from checking to downloading", () => {
  const state = otaUpdateReducer(initialOTAUpdateState, { type: "update-found" })

  assert.deepEqual(state, {
    attempt: 1,
    error: null,
    phase: "downloading"
  })
})

it("moves from downloading to restarting", () => {
  const downloading = otaUpdateReducer(initialOTAUpdateState, { type: "update-found" })
  const state = otaUpdateReducer(downloading, { type: "restart-started" })

  assert.deepEqual(state, {
    attempt: 1,
    error: null,
    phase: "restarting"
  })
})

it("records a failed first attempt", () => {
  const state = otaUpdateReducer(initialOTAUpdateState, {
    error: "offline",
    type: "failed"
  })

  assert.deepEqual(state, {
    attempt: 1,
    error: "offline",
    phase: "failed"
  })
})

it("starts a clean second attempt after retry", () => {
  const failed = otaUpdateReducer(initialOTAUpdateState, {
    error: "offline",
    type: "failed"
  })
  const state = otaUpdateReducer(failed, { type: "retry" })

  assert.deepEqual(state, {
    attempt: 2,
    error: null,
    phase: "checking"
  })
})

it("continues with the installed version", () => {
  const state = otaUpdateReducer(initialOTAUpdateState, { type: "continue" })

  assert.deepEqual(state, {
    attempt: 1,
    error: null,
    phase: "ready"
  })
})

it("normalizes native progress to an integer percentage", () => {
  assert.equal(toProgressPercentage(undefined), 0)
  assert.equal(toProgressPercentage(-1), 0)
  assert.equal(toProgressPercentage(0.684), 68)
  assert.equal(toProgressPercentage(2), 100)
})

it("finishes without downloading when no update is available", async () => {
  const calls: string[] = []

  const result = await runOTAUpdateAttempt(
    {
      checkForUpdate: async () => {
        calls.push("check")
        return { isAvailable: false, isRollBackToEmbedded: false }
      },
      fetchUpdate: async () => {
        calls.push("fetch")
        return { isNew: false, isRollBackToEmbedded: false }
      },
      reload: async () => {
        calls.push("reload")
      }
    },
    (phase) => calls.push(phase)
  )

  assert.equal(result, "ready")
  assert.deepEqual(calls, ["check"])
})

it("downloads and reloads a new update", async () => {
  const calls: string[] = []

  const result = await runOTAUpdateAttempt(
    {
      checkForUpdate: async () => {
        calls.push("check")
        return { isAvailable: true, isRollBackToEmbedded: false }
      },
      fetchUpdate: async () => {
        calls.push("fetch")
        return { isNew: true, isRollBackToEmbedded: false }
      },
      reload: async () => {
        calls.push("reload")
      }
    },
    (phase) => calls.push(phase)
  )

  assert.equal(result, "restarting")
  assert.deepEqual(calls, ["check", "downloading", "fetch", "restarting", "reload"])
})

it("applies a rollback directive", async () => {
  const calls: string[] = []

  const result = await runOTAUpdateAttempt(
    {
      checkForUpdate: async () => ({
        isAvailable: false,
        isRollBackToEmbedded: true
      }),
      fetchUpdate: async () => ({
        isNew: false,
        isRollBackToEmbedded: true
      }),
      reload: async () => {
        calls.push("reload")
      }
    },
    (phase) => calls.push(phase)
  )

  assert.equal(result, "restarting")
  assert.deepEqual(calls, ["downloading", "restarting", "reload"])
})

it("propagates update errors to the caller", async () => {
  const updateError = new Error("offline")

  await expect(
    runOTAUpdateAttempt(
      {
        checkForUpdate: async () => {
          throw updateError
        },
        fetchUpdate: async () => ({
          isNew: false,
          isRollBackToEmbedded: false
        }),
        reload: async () => undefined
      },
      () => undefined
    )
  ).rejects.toBe(updateError)
})

it("enables a valid mock scenario only in development", () => {
  assert.equal(resolveOTAMockScenario("success", true), "success")
  assert.equal(resolveOTAMockScenario("success", false), null)
  assert.equal(resolveOTAMockScenario("invalid", true), null)
  assert.equal(resolveOTAMockScenario(undefined, true), null)
})

it("simulates a successful progressive download", async () => {
  const phases: string[] = []
  const progressValues: number[] = []

  const result = await runMockOTAUpdateAttempt({
    attempt: 1,
    onPhaseChange: (phase) => phases.push(phase),
    onProgress: (progress) => progressValues.push(progress),
    scenario: "success",
    wait: async () => undefined
  })

  assert.equal(result, "ready")
  assert.deepEqual(phases, ["downloading", "restarting"])
  assert.equal(progressValues[0], 0)
  assert.equal(progressValues.at(-1), 1)
  assert.ok(
    progressValues.every((value, index) => index === 0 || value >= progressValues[index - 1])
  )
})

it("always-error fails every download attempt", async () => {
  for (const attempt of [1, 2]) {
    const progressValues: number[] = []

    await expect(
      runMockOTAUpdateAttempt({
        attempt,
        onPhaseChange: () => undefined,
        onProgress: (progress) => progressValues.push(progress),
        scenario: "always-error",
        wait: async () => undefined
      })
    ).rejects.toThrow("Falha simulada no download do update")

    assert.equal(progressValues.at(-1), 0.45)
  }
})

it("fail-once succeeds on the second attempt", async () => {
  const firstProgressValues: number[] = []

  await expect(
    runMockOTAUpdateAttempt({
      attempt: 1,
      onPhaseChange: () => undefined,
      onProgress: (progress) => firstProgressValues.push(progress),
      scenario: "fail-once",
      wait: async () => undefined
    })
  ).rejects.toThrow("Falha simulada no download do update")

  const secondPhases: string[] = []
  const secondProgressValues: number[] = []
  const result = await runMockOTAUpdateAttempt({
    attempt: 2,
    onPhaseChange: (phase) => secondPhases.push(phase),
    onProgress: (progress) => secondProgressValues.push(progress),
    scenario: "fail-once",
    wait: async () => undefined
  })

  assert.equal(firstProgressValues.at(-1), 0.45)
  assert.equal(result, "ready")
  assert.deepEqual(secondPhases, ["downloading", "restarting"])
  assert.equal(secondProgressValues.at(-1), 1)
})
