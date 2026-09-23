import type { UserSession } from "@/types/user-session"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { zustandSecureStore } from "@/lib/services/zustand-secure-store"

type State = {
  hasHydrated: boolean
  user: UserSession["user"] | null
}

type Actions = {
  setSession: (session: UserSession) => void
  clearSession: () => Promise<void>
}

export const USER_SESSION_STORAGE_KEY = "user-session-storage"

export const useUserSession = create<State & Actions>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,

      setSession: ({ user }) => set({ user }),

      clearSession: async () => {
        set({ user: null })
        await zustandSecureStore.removeItem(USER_SESSION_STORAGE_KEY)
      }
    }),
    {
      name: USER_SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => zustandSecureStore),
      onRehydrateStorage: () => () => {
        useUserSession.setState({ hasHydrated: true })
      }
    }
  )
)

export async function waitForUserSessionHydration() {
  if (useUserSession.getState().hasHydrated) return

  await new Promise<void>((resolve) => {
    const unsubscribe = useUserSession.subscribe((state) => {
      if (!state.hasHydrated) return

      unsubscribe()
      resolve()
    })
  })
}
