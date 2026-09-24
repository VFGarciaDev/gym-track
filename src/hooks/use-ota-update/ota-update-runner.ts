type UpdateCheckResult = {
  isAvailable: boolean
  isRollBackToEmbedded?: boolean
}

type UpdateFetchResult = {
  isNew: boolean
  isRollBackToEmbedded?: boolean
}

type OTAUpdateRunnerDependencies = {
  checkForUpdate: () => Promise<UpdateCheckResult>
  fetchUpdate: () => Promise<UpdateFetchResult>
  reload: () => Promise<void>
}

type OTAUpdateRunnerPhase = "downloading" | "restarting"

export async function runOTAUpdateAttempt(
  dependencies: OTAUpdateRunnerDependencies,
  onPhaseChange: (phase: OTAUpdateRunnerPhase) => void,
): Promise<"ready" | "restarting"> {
  const update = await dependencies.checkForUpdate()
  const shouldDownload = update.isAvailable || update.isRollBackToEmbedded === true

  if (!shouldDownload) return "ready"

  onPhaseChange("downloading")

  const downloadedUpdate = await dependencies.fetchUpdate()
  const shouldReload =
    downloadedUpdate.isNew || downloadedUpdate.isRollBackToEmbedded === true

  if (!shouldReload) return "ready"

  onPhaseChange("restarting")
  await dependencies.reload()

  return "restarting"
}
