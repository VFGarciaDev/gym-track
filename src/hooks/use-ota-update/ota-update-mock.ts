export type OTAMockScenario = "always-error" | "fail-once" | "success"

type MockUpdatePhase = "downloading" | "restarting"

type RunMockOTAUpdateAttemptOptions = {
  attempt: number
  onPhaseChange: (phase: MockUpdatePhase) => void
  onProgress: (progress: number) => void
  scenario: OTAMockScenario
  wait: (durationMs: number) => Promise<void>
}

const CHECK_DELAY_MS = 600
const DOWNLOAD_STEP_DELAY_MS = 250
const APPLY_DELAY_MS = 600
const DOWNLOAD_STEPS = 20
const FAILURE_PROGRESS = 0.45

export function resolveOTAMockScenario(
  value: string | undefined,
  isDevelopment: boolean,
): OTAMockScenario | null {
  if (!isDevelopment) return null

  if (value === "always-error" || value === "fail-once" || value === "success") {
    return value
  }

  return null
}

export async function runMockOTAUpdateAttempt({
  attempt,
  onPhaseChange,
  onProgress,
  scenario,
  wait,
}: RunMockOTAUpdateAttemptOptions): Promise<"ready"> {
  await wait(CHECK_DELAY_MS)
  onPhaseChange("downloading")
  onProgress(0)

  const shouldFail = scenario === "always-error" || (scenario === "fail-once" && attempt === 1)

  for (let step = 1; step <= DOWNLOAD_STEPS; step += 1) {
    await wait(DOWNLOAD_STEP_DELAY_MS)

    const progress = step / DOWNLOAD_STEPS
    onProgress(progress)

    if (shouldFail && progress === FAILURE_PROGRESS) {
      throw new Error("Falha simulada no download do update")
    }
  }

  onPhaseChange("restarting")
  await wait(APPLY_DELAY_MS)

  return "ready"
}
