import { AxiosError, AxiosHeaders, CanceledError } from "axios"
import { describe, expect, it } from "vitest"
import * as z from "zod"

import { apiErrorResponseSchema } from "@/types/api"

import { ApiRequestError } from "./api-request-error"
import { normalizeApiError } from "./normalize-api-error"

describe("api error response schema", () => {
  it("accepts an API error without field errors", () => {
    expect(
      apiErrorResponseSchema.parse({
        code: "NOT_FOUND",
        message: "Treino não encontrado."
      })
    ).toEqual({ code: "NOT_FOUND", message: "Treino não encontrado." })
  })

  it("accepts an API error with field errors", () => {
    expect(
      apiErrorResponseSchema.parse({
        code: "VALIDATION_ERROR",
        message: "Alguns dados são inválidos.",
        fields: { name: ["O nome é obrigatório."] }
      })
    ).toEqual({
      code: "VALIDATION_ERROR",
      message: "Alguns dados são inválidos.",
      fields: { name: ["O nome é obrigatório."] }
    })
  })
})

describe("normalizeApiError", () => {
  it("preserves an existing API request error", () => {
    const error = new ApiRequestError({ kind: "unexpected", message: "Falha existente." })

    expect(normalizeApiError(error)).toBe(error)
  })

  it("converts a Zod error into an invalid response error", () => {
    const result = z.string().safeParse(42)

    if (result.success) {
      throw new Error("Expected the fixture to be invalid.")
    }

    expect(normalizeApiError(result.error)).toMatchObject({
      kind: "invalidResponse",
      message: "O servidor retornou dados em um formato inválido.",
      cause: result.error
    })
  })

  it("converts Axios cancellation into a cancelled error", () => {
    const error = new CanceledError("cancelled")

    expect(normalizeApiError(error)).toMatchObject({
      kind: "cancelled",
      message: "A requisição foi cancelada.",
      cause: error
    })
  })

  it("converts an Axios failure without response into a network error", () => {
    const error = new AxiosError("Network Error", "ERR_NETWORK")

    expect(normalizeApiError(error)).toMatchObject({
      kind: "network",
      message: "Não foi possível conectar ao servidor.",
      cause: error
    })
  })

  it("preserves a valid API error response", () => {
    const error = createAxiosResponseError(
      {
        code: "VALIDATION_ERROR",
        message: "Alguns dados são inválidos.",
        fields: { name: ["O nome é obrigatório."] }
      },
      422
    )

    expect(normalizeApiError(error)).toMatchObject({
      kind: "api",
      status: 422,
      code: "VALIDATION_ERROR",
      message: "Alguns dados são inválidos.",
      fields: { name: ["O nome é obrigatório."] },
      cause: error
    })
  })

  it("converts a malformed API error response into an HTTP error", () => {
    const error = createAxiosResponseError({ detail: "invalid shape" }, 500)

    expect(normalizeApiError(error)).toMatchObject({
      kind: "http",
      status: 500,
      message: "O servidor não conseguiu concluir a requisição.",
      cause: error
    })
  })

  it("converts an ordinary error into an unexpected error", () => {
    const error = new Error("boom")

    expect(normalizeApiError(error)).toMatchObject({
      kind: "unexpected",
      message: "Ocorreu um erro inesperado.",
      cause: error
    })
  })
})

function createAxiosResponseError(data: unknown, status: number) {
  const error = new AxiosError("Request failed", "ERR_BAD_RESPONSE")

  error.response = {
    data,
    status,
    statusText: "Request failed",
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() }
  }

  return error
}
