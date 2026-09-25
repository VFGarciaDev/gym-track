import type { UserSignInType } from "@/api/auth/fetch-user-session/schema"

import { zodResolver } from "@hookform/resolvers/zod"
import { LockKeyhole, UserRound } from "lucide-react-native"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { View } from "react-native"
import Toast from "react-native-toast-message"

import { userSignInSchema } from "@/api/auth/fetch-user-session/schema"
import { Container } from "@/components/Container"
import { Button, ButtonText, Text } from "@/components/ui"
import { useAuth } from "@/contexts/AuthContext"

import { SignInFormControl } from "./components/SignInFormControl"

export function SignInContent() {
  const { signIn } = useAuth()
  const [keepConnected, setKeepConnected] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserSignInType>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: getDefaultCredentials(),
    resolver: zodResolver(userSignInSchema)
  })

  const onSubmit = async (credentials: UserSignInType) => {
    Toast.show({
      autoHide: false,
      type: "info",
      text1: "Carregando Informações...",
      text2: "Por favor, Aguarde um momento."
    })

    const response = await signIn(credentials)

    Toast.hide()
    if (response.status === "success") {
      Toast.show({
        text1: "Login realizado com sucesso!",
        topOffset: 40,
        type: "success",
        visibilityTime: 2000
      })

      return
    }

    Toast.show({
      type: "error",
      text1:
        response.error.code === "invalid_credentials"
          ? "Usuário ou senha inválidos"
          : "Ops! Falha ao tentar se conectar",
      text2: response.error.message
    })
  }

  return (
    <Container contentContainerClassName="justify-center">
      <View className="mb-10 items-center gap-2">
        <Text className="text-3xl font-bold">Bem-Vindo</Text>
        <Text className="text-lg text-muted-foreground">Entre para acompanhar seus treinos</Text>
      </View>

      <View className="mb-16 gap-5">
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => {
            const isError = !!errors.username

            return (
              <SignInFormControl
                label="Usuário"
                icon={UserRound}
                value={value}
                placeholder="usuário"
                onChangeText={onChange}
                isError={isError}
                errorMsg={errors.username?.message}
              />
            )
          }}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => {
            const isError = !!errors.password

            return (
              <SignInFormControl
                isPassword
                label="Senha"
                icon={LockKeyhole}
                value={value}
                placeholder="senha"
                onChangeText={onChange}
                isError={isError}
                errorMsg={errors.password?.message}
              />
            )
          }}
        />
      </View>

      <Button
        onPress={handleSubmit(onSubmit)}
        isDisabled={isSubmitting}
        className="rounded-xl py-3"
      >
        <ButtonText className="text-xl tracking-wide">Entrar</ButtonText>
      </Button>
    </Container>
  )
}

function getDefaultCredentials(): UserSignInType {
  if (__DEV__) {
    return {
      username: process.env.EXPO_PUBLIC_APP_USERNAME ?? "",
      password: process.env.EXPO_PUBLIC_APP_PASSWORD ?? ""
    }
  }

  return {
    username: "",
    password: ""
  }
}
