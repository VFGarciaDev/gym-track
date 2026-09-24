import assert from "node:assert/strict"
// eslint-disable-next-line test/no-import-node-test -- this project uses Node's dependency-free runner
import test from "node:test"

import {
  initialOTAUpdateState,
  otaUpdateReducer,
  toProgressPercentage,
} from "./ota-update-state.ts"
import {
  resolveOTAMockScenario,
  runMockOTAUpdateAttempt,
} from "./ota-update-mock.ts"
import { runOTAUpdateAttempt } from "./ota-update-runner.ts"

test("moves from checking to downloading", () => {
  const state = otaUpdateReducer(initialOTAUpdateState, { type: "update-found" })

  assert.deepEqual(state, {
    attempt: 1,
    error: null,
    phase: "downloading",
  })
})

test("moves from downloading to restarting", () => {
  const downloading = otaUpdateReducer(initialOTAUpdateState, { type: "update-found" })
  const state = otaUpdateReducer(downloading, { type: "restart-started" })

  assert.deepEqual(state, {
    attempt: 1,
    error: null,
    phase: "restarting",
  })
})

test("records a failed first attempt", () => {
  const state = otaUpdateReducer(initialOTAUpdateState, {
    error: "offline",
    type: "failed",
  })

  assert.deepEqual(state, {
    attempt: 1,
    error: "offline",
    phase: "failed",
  })
})

test("starts a clean second attempt after retry", () => {
  const failed = otaUpdateReducer(initialOTAUpdateState, {
    error: "offline",
    type: "failed",
  })
  const state = otaUpdateReducer(failed, { type: "retry" })

  assert.deepEqual(state, {
    attempt: 2,
    error: null,
    phase: "checking",
  })
})

test("continues with the installed version", () => {
  const state = otaUpdateReducer(initialOTAUpdateState, { type: "continue" })

  assert.deepEqual(state, {
    attempt: 1,
    error: null,
    phase: "ready",
  })
})

test("normalizes native progress to an integer percentage", () => {
  assert.equal(toProgressPercentage(undefined), 0)
  assert.equal(toProgressPercentage(-1), 0)
  assert.equal(toProgressPercentage(0.684), 68)
  assert.equal(toProgressPercentage(2), 100)
})

test("finishes without downloading when no update is available", async () => {
  const calls = []

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
      },
    },
    (phase) => calls.push(phase),
  )

  assert.equal(result, "ready")
  assert.deepEqual(calls, ["check"])
})

test("downloads and reloads a new update", async () => {
  const calls = []

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
      },
    },
    (phase) => calls.push(phase),
  )

  assert.equal(result, "restarting")
  assert.deepEqual(calls, ["check", "downloading", "fetch", "restarting", "reload"])
})

test("applies a rollback directive", async () => {
  const calls = []

  const result = await runOTAUpdateAttempt(
    {
      checkForUpdate: async () => ({
        isAvailable: false,
        isRollBackToEmbedded: true,
      }),
      fetchUpdate: async () => ({
        isNew: false,
        isRollBackToEmbedded: true,
      }),
      reload: async () => {
        calls.push("reload")
      },
    },
    (phase) => calls.push(phase),
  )

  assert.equal(result, "restarting")
  assert.deepEqual(calls, ["downloading", "restarting", "reload"])
})

test("propagates update errors to the caller", async () => {
  const updateError = new Error("offline")

  await assert.rejects(
    runOTAUpdateAttempt(
      {
        checkForUpdate: async () => {
          throw updateError
        },
        fetchUpdate: async () => ({
          isNew: false,
          isRollBackToEmbedded: false,
        }),
        reload: async () => undefined,
      },
      () => undefined,
    ),
    updateError,
  )
})

test("enables a valid mock scenario only in development", () => {
  assert.equal(resolveOTAMockScenario("success", true), "success")
  assert.equal(resolveOTAMockScenario("success", false), null)
  assert.equal(resolveOTAMockScenario("invalid", true), null)
  assert.equal(resolveOTAMockScenario(undefined, true), null)
})

test("simulates a successful progressive download", async () => {
  const phases = []
  const progressValues = []

  const result = await runMockOTAUpdateAttempt({
    attempt: 1,
    onPhaseChange: phase => phases.push(phase),
    onProgress: progress => progressValues.push(progress),
    scenario: "success",
    wait: async () => undefined,
  })

  assert.equal(result, "ready")
  assert.deepEqual(phases, ["downloading", "restarting"])
  assert.equal(progressValues[0], 0)
  assert.equal(progressValues.at(-1), 1)
  assert.ok(progressValues.every((value, index) => index === 0 || value >= progressValues[index - 1]))
})

test("always-error fails every download attempt", async () => {
  for (const attempt of [1, 2]) {
    const progressValues = []

    await assert.rejects(
      runMockOTAUpdateAttempt({
        attempt,
        onPhaseChange: () => undefined,
        onProgress: progress => progressValues.push(progress),
        scenario: "always-error",
        wait: async () => undefined,
      }),
    )

    assert.equal(progressValues.at(-1), 0.45)
  }
})

test("fail-once succeeds on the second attempt", async () => {
  const firstProgressValues = []

  await assert.rejects(
    runMockOTAUpdateAttempt({
      attempt: 1,
      onPhaseChange: () => undefined,
      onProgress: progress => firstProgressValues.push(progress),
      scenario: "fail-once",
      wait: async () => undefined,
    }),
  )

  const secondPhases = []
  const secondProgressValues = []
  const result = await runMockOTAUpdateAttempt({
    attempt: 2,
    onPhaseChange: phase => secondPhases.push(phase),
    onProgress: progress => secondProgressValues.push(progress),
    scenario: "fail-once",
    wait: async () => undefined,
  })

  assert.equal(firstProgressValues.at(-1), 0.45)
  assert.equal(result, "ready")
  assert.deepEqual(secondPhases, ["downloading", "restarting"])
  assert.equal(secondProgressValues.at(-1), 1)
})
