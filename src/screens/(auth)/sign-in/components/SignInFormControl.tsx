import type { IInputFieldProps } from "@/components/ui"
import type { LucideIcon } from "lucide-react-native"

import { AlertCircle, Eye, EyeOff } from "lucide-react-native"

import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputField,
  InputIcon,
  InputSlot
} from "@/components/ui"
import { useState } from "react"

type FormControlProps = IInputFieldProps & {
  label: string
  icon: LucideIcon
  isError: boolean
  errorMsg?: string
  isPassword?: boolean
}

export function SignInFormControl({
  icon,
  label,
  isError,
  errorMsg,
  isPassword = false,
  ...props
}: FormControlProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <FormControl isInvalid={isError}>
      <FormControlLabel>
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>

      <Input className="mt-1 rounded-xl">
        <InputSlot>
          <InputIcon as={icon} className="h-6 w-6" />
        </InputSlot>

        <InputField className="text-lg" secureTextEntry={isPassword && !showPassword} {...props} />

        {isPassword && (
          <InputSlot onPress={() => setShowPassword(!showPassword)}>
            <InputIcon className="mr-2 h-6 w-6" as={showPassword ? Eye : EyeOff} />
          </InputSlot>
        )}
      </Input>

      {isError && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} className="text-destructive" />
          <FormControlErrorText className="text-destructive">{errorMsg}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  )
}
