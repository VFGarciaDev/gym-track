import * as SplashScreen from "expo-splash-screen"
import * as Updates from "expo-updates"
import { useCallback, useEffect, useReducer, useRef, useState } from "react"

import { resolveOTAMockScenario, runMockOTAUpdateAttempt } from "./ota-update-mock"
import { runOTAUpdateAttempt } from "./ota-update-runner"
import {
  initialOTAUpdateState,
  OTA_UPDATE_AUTO_CONTINUE_SECONDS,
  otaUpdateReducer,
  toProgressPercentage
} from "./ota-update-state"

void SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
  console.error("Não foi possível manter a splash visível", error)
})

SplashScreen.setOptions({
  duration: 300,
  fade: true
})

const otaMockScenario = resolveOTAMockScenario(process.env.EXPO_PUBLIC_OTA_MOCK_SCENARIO, __DEV__)

export function useOTAUpdate() {
  const { downloadProgress } = Updates.useUpdates()
  const [state, dispatch] = useReducer(otaUpdateReducer, initialOTAUpdateState)
  const [mockDownloadProgress, setMockDownloadProgress] = useState(0)
  const [secondsUntilContinue, setSecondsUntilContinue] = useState(OTA_UPDATE_AUTO_CONTINUE_SECONDS)
  const activeAttemptIdRef = useRef(0)
  const hasStartedRef = useRef(false)
  const splashVisibilityRef = useRef<"visible" | "hiding" | "hidden">("visible")

  const runAttempt = useCallback(async (attemptId: number) => {
    if (!otaMockScenario && (__DEV__ || !Updates.isEnabled)) {
      if (attemptId === activeAttemptIdRef.current) {
        dispatch({ type: "continue" })
      }
      return
    }

    try {
      const handlePhaseChange = (phase: "downloading" | "restarting") => {
        if (attemptId !== activeAttemptIdRef.current) return

        dispatch({
          type: phase === "downloading" ? "update-found" : "restart-started"
        })
      }
      const result = otaMockScenario
        ? await runMockOTAUpdateAttempt({
            attempt: attemptId,
            onPhaseChange: handlePhaseChange,
            onProgress: (progress) => {
              if (attemptId === activeAttemptIdRef.current) {
                setMockDownloadProgress(progress)
              }
            },
            scenario: otaMockScenario,
            wait: (durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs))
          })
        : await runOTAUpdateAttempt(
            {
              checkForUpdate: async () => {
                const update = await Updates.checkForUpdateAsync()

                if (attemptId !== activeAttemptIdRef.current) {
                  return { isAvailable: false, isRollBackToEmbedded: false }
                }

                return update
              },
              fetchUpdate: async () => {
                const update = await Updates.fetchUpdateAsync()

                if (attemptId !== activeAttemptIdRef.current) {
                  return { isNew: false, isRollBackToEmbedded: false }
                }

                return update
              },
              reload: async () => {
                if (attemptId !== activeAttemptIdRef.current) return

                await Updates.reloadAsync()
              }
            },
            handlePhaseChange
          )

      if (result === "ready" && attemptId === activeAttemptIdRef.current) {
        dispatch({ type: "continue" })
      }
    } catch (error: unknown) {
      if (attemptId !== activeAttemptIdRef.current) return

      console.error("Falha ao atualizar o aplicativo", error)
      dispatch({
        error: error instanceof Error ? error.message : String(error),
        type: "failed"
      })
    }
  }, [])

  const startAttempt = useCallback(() => {
    activeAttemptIdRef.current += 1
    void runAttempt(activeAttemptIdRef.current)
  }, [runAttempt])

  const continueWithInstalledVersion = useCallback(() => {
    activeAttemptIdRef.current += 1
    dispatch({ type: "continue" })
  }, [])

  const retry = useCallback(() => {
    setMockDownloadProgress(0)
    setSecondsUntilContinue(OTA_UPDATE_AUTO_CONTINUE_SECONDS)
    dispatch({ type: "retry" })
    startAttempt()
  }, [startAttempt])

  const hideNativeSplash = useCallback(() => {
    if (splashVisibilityRef.current !== "visible") return

    splashVisibilityRef.current = "hiding"
    void SplashScreen.hideAsync()
      .then(() => {
        splashVisibilityRef.current = "hidden"
      })
      .catch((error: unknown) => {
        splashVisibilityRef.current = "visible"
        console.error("Não foi possível ocultar a splash", error)
      })
  }, [])

  useEffect(() => {
    if (hasStartedRef.current) return

    hasStartedRef.current = true
    startAttempt()
  }, [startAttempt])

  useEffect(() => {
    if (state.phase !== "failed") return

    const countdownInterval = setInterval(() => {
      setSecondsUntilContinue((currentValue) => Math.max(0, currentValue - 1))
    }, 1000)
    const continueTimeout = setTimeout(
      continueWithInstalledVersion,
      OTA_UPDATE_AUTO_CONTINUE_SECONDS * 1000
    )

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(continueTimeout)
    }
  }, [continueWithInstalledVersion, state.attempt, state.phase])

  return {
    continueWithInstalledVersion,
    error: state.error,
    hideNativeSplash,
    phase: state.phase,
    progress: toProgressPercentage(otaMockScenario ? mockDownloadProgress : downloadProgress),
    retry,
    secondsUntilContinue
  }
}
