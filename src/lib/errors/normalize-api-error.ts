import axios from "axios"
import * as z from "zod"

import { apiErrorResponseSchema } from "@/types/api"

import { ApiRequestError } from "./api-request-error"

export function normalizeApiError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error
  }

  if (error instanceof z.ZodError) {
    return new ApiRequestError({
      kind: "invalidResponse",
      message: "O servidor retornou dados em um formato inválido.",
      cause: error
    })
  }

  if (axios.isCancel(error)) {
    return new ApiRequestError({
      kind: "cancelled",
      message: "A requisição foi cancelada.",
      cause: error
    })
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiRequestError({
        kind: "network",
        message: "Não foi possível conectar ao servidor.",
        cause: error
      })
    }

    const apiError = apiErrorResponseSchema.safeParse(error.response.data)

    if (apiError.success) {
      return new ApiRequestError({
        kind: "api",
        status: error.response.status,
        code: apiError.data.code,
        message: apiError.data.message,
        fields: apiError.data.fields,
        cause: error
      })
    }

    return new ApiRequestError({
      kind: "http",
      status: error.response.status,
      message: "O servidor não conseguiu concluir a requisição.",
      cause: error
    })
  }

  return new ApiRequestError({
    kind: "unexpected",
    message: "Ocorreu um erro inesperado.",
    cause: error
  })
}
