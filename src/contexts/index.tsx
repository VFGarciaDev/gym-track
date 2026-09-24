import type { PropsWithChildren } from "react"

import { SafeAreaProvider } from "react-native-safe-area-context"

import AuthProvider from "./AuthContext"
import ThemeProvider from "./ThemeContext"

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
