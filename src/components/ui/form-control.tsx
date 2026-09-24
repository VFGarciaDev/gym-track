"use client"
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils"

import { createFormControl } from "@gluestack-ui/core/form-control/creator"
import { UIIcon } from "@gluestack-ui/core/icon/creator"
import { tva, withStyleContext } from "@gluestack-ui/utils/nativewind-utils"
import { styled } from "nativewind"
import React from "react"
import { Text, View } from "react-native"

const SCOPE = "FORM_CONTROL"

const formControlStyle = tva({
  base: "flex flex-col"
})

const formControlErrorIconStyle = tva({
  base: "h-[18px] w-[18px] fill-none text-destructive"
})

const formControlErrorStyle = tva({
  base: "mt-1 flex flex-row items-center justify-start gap-1"
})

const formControlErrorTextStyle = tva({
  base: "font-body text-xs text-destructive",
  variants: {
    isTruncated: {
      true: "web:truncate"
    },
    bold: {
      true: "font-bold"
    },
    underline: {
      true: "underline"
    },
    strikeThrough: {
      true: "line-through"
    },
    sub: {
      true: "text-xs"
    },
    italic: {
      true: "italic"
    },
    highlight: {
      true: "bg-yellow-500"
    }
  }
})

const formControlHelperStyle = tva({
  base: "font-body mt-1 flex flex-row items-center justify-start"
})

const formControlHelperTextStyle = tva({
  base: "font-body text-sm text-foreground/70",
  variants: {
    isTruncated: {
      true: "web:truncate"
    },
    bold: {
      true: "font-bold"
    },
    underline: {
      true: "underline"
    },
    strikeThrough: {
      true: "line-through"
    },
    sub: {
      true: "text-xs"
    },
    italic: {
      true: "italic"
    },
    highlight: {
      true: "bg-yellow-500"
    }
  }
})

const formControlLabelStyle = tva({
  base: "mb-1 flex flex-row items-center justify-start"
})

const formControlLabelTextStyle = tva({
  base: "font-body text-base font-medium text-foreground",
  variants: {
    isTruncated: {
      true: "web:truncate"
    },
    bold: {
      true: "font-bold"
    },
    underline: {
      true: "underline"
    },
    strikeThrough: {
      true: "line-through"
    },
    sub: {
      true: "text-xs"
    },
    italic: {
      true: "italic"
    },
    highlight: {
      true: "bg-yellow-500"
    }
  }
})

const formControlLabelAstrickStyle = tva({
  base: "text-base font-medium text-foreground",
  variants: {
    isTruncated: {
      true: "web:truncate"
    },
    bold: {
      true: "font-bold"
    },
    underline: {
      true: "underline"
    },
    strikeThrough: {
      true: "line-through"
    },
    sub: {
      true: "text-xs"
    },
    italic: {
      true: "italic"
    },
    highlight: {
      true: "bg-yellow-500"
    }
  }
})

type IFormControlLabelAstrickProps = React.ComponentPropsWithoutRef<typeof Text> &
  VariantProps<typeof formControlLabelAstrickStyle>

const FormControlLabelAstrick = React.forwardRef<
  React.ComponentRef<typeof Text>,
  IFormControlLabelAstrickProps
>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={formControlLabelAstrickStyle({
        class: className
      })}
      {...props}
    />
  )
})

const StyledUIIcon = styled(UIIcon, { className: "style" })

export const UIFormControl = createFormControl({
  Root: withStyleContext(View, SCOPE),
  Error: View,
  ErrorText: Text,
  ErrorIcon: StyledUIIcon,
  Label: View,
  LabelText: Text,
  LabelAstrick: FormControlLabelAstrick,
  Helper: View,
  HelperText: Text
})

type IFormControlProps = React.ComponentProps<typeof UIFormControl> &
  VariantProps<typeof formControlStyle>

const FormControl = React.forwardRef<React.ComponentRef<typeof UIFormControl>, IFormControlProps>(
  ({ className, ...props }, ref) => {
    return <UIFormControl ref={ref} className={formControlStyle({ class: className })} {...props} />
  }
)

type IFormControlErrorProps = React.ComponentProps<typeof UIFormControl.Error> &
  VariantProps<typeof formControlErrorStyle>

const FormControlError = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Error>,
  IFormControlErrorProps
>(({ className, ...props }, ref) => {
  return (
    <UIFormControl.Error
      ref={ref}
      className={formControlErrorStyle({ class: className })}
      {...props}
    />
  )
})

type IFormControlErrorTextProps = React.ComponentProps<typeof UIFormControl.Error.Text> &
  VariantProps<typeof formControlErrorTextStyle>

const FormControlErrorText = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Error.Text>,
  IFormControlErrorTextProps
>(({ className, ...props }, ref) => {
  return (
    <UIFormControl.Error.Text
      className={formControlErrorTextStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

type IFormControlErrorIconProps = React.ComponentProps<typeof UIFormControl.Error.Icon> &
  VariantProps<typeof formControlErrorIconStyle>

const FormControlErrorIcon = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Error.Icon>,
  IFormControlErrorIconProps
>(({ className, ...props }, ref) => {
  return (
    <UIFormControl.Error.Icon
      ref={ref}
      {...props}
      className={formControlErrorIconStyle({ class: className })}
    />
  )
})

type IFormControlLabelProps = React.ComponentProps<typeof UIFormControl.Label> &
  VariantProps<typeof formControlLabelStyle> & {
    htmlFor?: string
    role?: string
  }

const FormControlLabel = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Label>,
  IFormControlLabelProps
>(({ className, ...props }, ref) => {
  return (
    <UIFormControl.Label
      ref={ref}
      className={formControlLabelStyle({ class: className })}
      {...props}
    />
  )
})

type IFormControlLabelTextProps = React.ComponentProps<typeof UIFormControl.Label.Text> &
  VariantProps<typeof formControlLabelTextStyle>

const FormControlLabelText = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Label.Text>,
  IFormControlLabelTextProps
>(({ className, ...props }, ref) => {
  return (
    <UIFormControl.Label.Text
      className={formControlLabelTextStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

type IFormControlHelperProps = React.ComponentProps<typeof UIFormControl.Helper> &
  VariantProps<typeof formControlHelperStyle>

const FormControlHelper = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Helper>,
  IFormControlHelperProps
>(({ className, ...props }, ref) => {
  return (
    <UIFormControl.Helper
      ref={ref}
      className={formControlHelperStyle({
        class: className
      })}
      {...props}
    />
  )
})

type IFormControlHelperTextProps = React.ComponentProps<typeof UIFormControl.Helper.Text> &
  VariantProps<typeof formControlHelperTextStyle>

const FormControlHelperText = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Helper.Text>,
  IFormControlHelperTextProps
>(({ className, ...props }, ref) => {
  return (
    <UIFormControl.Helper.Text
      className={formControlHelperTextStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

FormControl.displayName = "FormControl"
FormControlError.displayName = "FormControlError"
FormControlErrorText.displayName = "FormControlErrorText"
FormControlErrorIcon.displayName = "FormControlErrorIcon"
FormControlLabel.displayName = "FormControlLabel"
FormControlLabelText.displayName = "FormControlLabelText"
FormControlLabelAstrick.displayName = "FormControlLabelAstrick"
FormControlHelper.displayName = "FormControlHelper"
FormControlHelperText.displayName = "FormControlHelperText"

export {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelAstrick,
  FormControlLabelText
}
