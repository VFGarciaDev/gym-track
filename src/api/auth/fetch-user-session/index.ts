import type { UserSignInType } from "./schema"
import type { UserSession } from "@/types/user-session"

import axios from "axios"

import { InvalidCredentialsError } from "@/lib/errors/InvalidCredentialsError"
// import { api } from "@/lib/services/api"

import { userSessionApiResponseSchema } from "./schema"
const userName = process.env.EXPO_PUBLIC_APP_USERNAME
const password = process.env.EXPO_PUBLIC_APP_PASSWORD

export async function fetchUserSession(credentials: UserSignInType) {
  // const endpoint = "/auth/session"

  try {
    // const response = await api.post<UserSession>(endpoint, credentials)
    if (credentials.username !== userName || credentials.password !== password) {
      throw new InvalidCredentialsError()
    }

    const data: UserSession["user"] = {
      name: "Mayra B Silva",
      email: "",
      taxId: ""
    }

    return userSessionApiResponseSchema.parse({ user: data })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new InvalidCredentialsError()
    }

    throw error
  }
}
