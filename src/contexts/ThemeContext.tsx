import type { PropsWithChildren } from "react"
import type { ColorSchemeName } from "react-native"

import { OverlayProvider } from "@gluestack-ui/core/overlay/creator"
import { ToastProvider } from "@gluestack-ui/core/toast/creator"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Appearance, View } from "react-native"

type Theme = "light" | "dark"

type ThemeContextProps = {
  theme: Theme
  isDarkMode: boolean
  toggleTheme: (newTheme?: Theme) => void
}

const initialThemeContext: ThemeContextProps = {
  theme: "light",
  isDarkMode: false,
  toggleTheme: () => null
}

const ThemeContext = createContext<ThemeContextProps>(initialThemeContext)

export default function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>("light")
  const isDarkMode = theme === "dark"

  const toggleTheme = useCallback(
    (newTheme?: Theme) => {
      if (newTheme) {
        setTheme(newTheme)
      } else {
        setTheme(isDarkMode ? "light" : "dark")
      }
    },
    [isDarkMode]
  )

  useEffect(() => {
    Appearance.setColorScheme(theme as ColorSchemeName)
  }, [theme])

  const contextValue: ThemeContextProps = useMemo(
    () => ({
      theme,
      isDarkMode,
      toggleTheme
    }),
    [theme, isDarkMode, toggleTheme]
  )

  return (
    <ThemeContext value={contextValue}>
      <View className="flex-1 bg-background">
        <OverlayProvider>
          <ToastProvider>{children}</ToastProvider>
        </OverlayProvider>
      </View>
    </ThemeContext>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider />")
  }

  return context
}
