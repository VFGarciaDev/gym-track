import type { StateStorage } from "zustand/middleware"

import * as SecureStore from "expo-secure-store"

export const zustandSecureStore: StateStorage = {
  getItem: async (name: string) => {
    return await SecureStore.getItemAsync(name)
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value)
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name)
  },
}
