import type { UserSession } from "@/types/user-session"

import * as SecureStore from "expo-secure-store"

import { USER_SESSION_STORAGE_KEY } from "@/store/user-session"

type PersistedUserSession = {
  state?: Partial<UserSession>
}

export async function getAccessToken(): Promise<string | null> {
  const storedSession = await SecureStore.getItemAsync(USER_SESSION_STORAGE_KEY)

  if (!storedSession) return null

  try {
    const persistedSession = JSON.parse(storedSession) as PersistedUserSession
    const accessToken = persistedSession.state?.accessToken

    return typeof accessToken === "string" ? accessToken : null
  } catch {
    return null
  }
}
