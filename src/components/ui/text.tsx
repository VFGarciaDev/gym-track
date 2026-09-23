import type { TextProps } from "react-native"

import { Text as RNText } from "react-native"

import { cn } from "@/lib/utils/cn"

export function Text({ className, ...props }: TextProps) {
  return <RNText className={cn("text-typography", className)} {...props} />
}
