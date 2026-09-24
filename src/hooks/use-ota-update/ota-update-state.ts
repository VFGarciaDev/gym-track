export const OTA_UPDATE_AUTO_CONTINUE_SECONDS = 30

export type OTAUpdatePhase =
  | "checking"
  | "downloading"
  | "restarting"
  | "failed"
  | "ready"

export type OTAUpdateState = {
  attempt: number
  error: string | null
  phase: OTAUpdatePhase
}

export type OTAUpdateAction =
  | { type: "continue" }
  | { error: string, type: "failed" }
  | { type: "restart-started" }
  | { type: "retry" }
  | { type: "update-found" }

export const initialOTAUpdateState: OTAUpdateState = {
  attempt: 1,
  error: null,
  phase: "checking",
}

export function otaUpdateReducer(
  state: OTAUpdateState,
  action: OTAUpdateAction,
): OTAUpdateState {
  switch (action.type) {
    case "continue": {
      return { ...state, error: null, phase: "ready" }
    }
    case "failed": {
      return { ...state, error: action.error, phase: "failed" }
    }
    case "restart-started": {
      return { ...state, error: null, phase: "restarting" }
    }
    case "retry": {
      return {
        attempt: state.attempt + 1,
        error: null,
        phase: "checking",
      }
    }
    case "update-found": {
      return { ...state, error: null, phase: "downloading" }
    }
  }
}

export function toProgressPercentage(progress?: number): number {
  const normalizedProgress = Math.min(1, Math.max(0, progress ?? 0))

  return Math.round(normalizedProgress * 100)
}
