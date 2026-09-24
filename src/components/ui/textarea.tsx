"use client"
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils"

import { createTextarea } from "@gluestack-ui/core/textarea/creator"
import { tva, useStyleContext, withStyleContext } from "@gluestack-ui/utils/nativewind-utils"
import React from "react"
import { TextInput, View } from "react-native"

const SCOPE = "TEXTAREA"
const UITextarea = createTextarea({
  Root: withStyleContext(View, SCOPE),
  Input: TextInput
})

const textareaStyle = tva({
  base: "h-[100px] w-full rounded border border-border data-[disabled=true]:bg-background/90 data-[disabled=true]:opacity-40 data-[focus=true]:border-primary/80 data-[hover=true]:border-border/80 data-[disabled=true]:data-[hover=true]:border-border/80 data-[focus=true]:data-[hover=true]:border-primary/80 dark:bg-input/30",

  variants: {
    variant: {
      default:
        "data-[focus=true]:web:ring-indicator-primary data-[invalid=true]:web:ring-indicator-error data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-indicator-primary data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-indicator-error data-[focus=true]:border-primary/80 data-[invalid=true]:border-destructive data-[invalid=true]:data-[hover=true]:border-destructive data-[invalid=true]:data-[disabled=true]:data-[hover=true]:border-destructive data-[invalid=true]:data-[focus=true]:data-[hover=true]:border-primary/80 data-[focus=true]:web:ring-1 data-[focus=true]:web:ring-inset data-[invalid=true]:web:ring-1 data-[invalid=true]:web:ring-inset data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-1 data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-inset data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-1 data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-inset"
    },
    size: {
      sm: "",
      md: "",
      lg: "",
      xl: ""
    }
  }
})

const textareaInputStyle = tva({
  base: "flex-1 p-2 text-foreground placeholder:text-foreground/60 web:cursor-text web:outline-0 web:outline-none web:data-[disabled=true]:cursor-not-allowed",
  parentVariants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl"
    }
  }
})

type ITextareaProps = React.ComponentProps<typeof UITextarea> & VariantProps<typeof textareaStyle>

const Textarea = React.forwardRef<React.ComponentRef<typeof UITextarea>, ITextareaProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <UITextarea
        ref={ref}
        {...props}
        className={textareaStyle({ variant, class: className })}
        context={{ size }}
      />
    )
  }
)

type ITextareaInputProps = React.ComponentProps<typeof UITextarea.Input> &
  VariantProps<typeof textareaInputStyle>

const TextareaInput = React.forwardRef<
  React.ComponentRef<typeof UITextarea.Input>,
  ITextareaInputProps
>(({ className, ...props }, ref) => {
  const { size: parentSize } = useStyleContext(SCOPE)

  return (
    <UITextarea.Input
      ref={ref}
      {...props}
      textAlignVertical="top"
      className={textareaInputStyle({
        parentVariants: {
          size: parentSize
        },
        class: className
      })}
    />
  )
})

Textarea.displayName = "Textarea"
TextareaInput.displayName = "TextareaInput"

export { Textarea, TextareaInput }
