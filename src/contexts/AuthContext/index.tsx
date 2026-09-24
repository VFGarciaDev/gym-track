import type { UserSignInType } from "@/api/auth/fetch-user-session/schema"
import type { PropsWithChildren } from "react"

import axios from "axios"
import { createContext, useCallback, useContext, useMemo, useRef } from "react"

import { fetchUserSession } from "@/api/auth/fetch-user-session"
import { InvalidCredentialsError } from "@/lib/errors/InvalidCredentialsError"
import { useUserSession, waitForUserSessionHydration } from "@/store/user-session"

export type SignInResponse =
  | { status: "success" }
  | {
      status: "error"
      error: {
        code: "invalid_credentials" | "network" | "unexpected"
        message: string
      }
    }

type AuthContextProps = {
  isAuthenticated?: boolean
  signIn: (credentials: UserSignInType) => Promise<SignInResponse>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export default function AuthProvider({ children }: PropsWithChildren) {
  const user = useUserSession((state) => state.user)
  const hasHydrated = useUserSession((state) => state.hasHydrated)
  const setSession = useUserSession((state) => state.setSession)
  const clearSession = useUserSession((state) => state.clearSession)
  const operationIdRef = useRef(0)

  const signIn = useCallback(
    async (credentials: UserSignInType): Promise<SignInResponse> => {
      const currentOperationId = ++operationIdRef.current

      try {
        await waitForUserSessionHydration()
        const session = await fetchUserSession(credentials)

        if (currentOperationId !== operationIdRef.current) {
          return createSignInError("unexpected", "A tentativa de login foi cancelada.")
        }

        setSession(session)

        return { status: "success" }
      } catch (error) {
        if (error instanceof InvalidCredentialsError) {
          return createSignInError("invalid_credentials", error.message)
        }

        if (axios.isAxiosError(error)) {
          return createSignInError("network", "Não foi possível conectar ao servidor.")
        }

        return createSignInError("unexpected", "Ocorreu um erro inesperado. Tente novamente.")
      }
    },
    [setSession]
  )

  const signOut = useCallback(async () => {
    operationIdRef.current += 1

    await waitForUserSessionHydration()
    await clearSession()
  }, [clearSession])

  const value: AuthContextProps = useMemo(
    () => ({
      signIn,
      signOut,
      isAuthenticated: hasHydrated ? Boolean(user) : undefined
    }),
    [hasHydrated, signIn, signOut, user]
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider />")
  }

  return context
}

function createSignInError(
  code: "invalid_credentials" | "network" | "unexpected",
  message: string
): SignInResponse {
  return { status: "error", error: { code, message } }
}
