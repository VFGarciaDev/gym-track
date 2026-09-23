import type { UserSignInType } from "./schema"
import type { UserSession } from "@/types/user-session"

import axios from "axios"

import { InvalidCredentialsError } from "@/lib/errors/InvalidCredentialsError"
import { api } from "@/lib/services/api"

import { userSessionApiResponseSchema } from "./schema"

export async function fetchUserSession(credentials: UserSignInType) {
  const endpoint = "/auth/session"

  try {
    const response = await api.post<UserSession>(endpoint, credentials)

    return userSessionApiResponseSchema.parse(response.data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new InvalidCredentialsError()
    }

    throw error
  }
}
