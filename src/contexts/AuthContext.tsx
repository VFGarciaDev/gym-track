import type { UserSignInType } from "@/api/auth/fetch-user-session/schema"
import type { PropsWithChildren } from "react"

import { createContext, useCallback, useContext, useMemo, useRef } from "react"

import { fetchUserSession } from "@/api/auth/fetch-user-session"
import { useUserSession, waitForUserSessionHydration } from "@/store/user-session"

type AuthContextProps = {
  isAuthenticated?: boolean
  signIn: (credentials: UserSignInType) => Promise<void>
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
    async (credentials: UserSignInType) => {
      const currentOperationId = ++operationIdRef.current

      await waitForUserSessionHydration()
      const session = await fetchUserSession(credentials)

      if (currentOperationId !== operationIdRef.current) return

      setSession(session)
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
