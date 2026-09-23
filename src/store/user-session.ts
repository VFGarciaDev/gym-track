import type { UserSession } from "@/types/user-session"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { zustandSecureStore } from "@/lib/services/zustand-secure-store"

type State = {
  accessToken: UserSession["accessToken"] | null
  user: UserSession["user"] | null
}

type Actions = {
  setSession: (session: UserSession) => void
  clearSession: () => void
}

export const USER_SESSION_STORAGE_KEY = "user-session-storage"

export const useUserSession = create<State & Actions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setSession: ({ accessToken, user }) => set({ accessToken, user }),
      clearSession: () => set({ accessToken: null, user: null }),
    }),
    {
      name: USER_SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => zustandSecureStore),
    },
  ),
)
