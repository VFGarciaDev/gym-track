export type ApiRequestErrorKind =
  "api" | "network" | "invalidResponse" | "cancelled" | "http" | "unexpected"

export type ApiRequestErrorOptions = {
  kind: ApiRequestErrorKind
  message: string
  status?: number
  code?: string
  fields?: Record<string, string[]>
  cause?: unknown
}

export class ApiRequestError extends Error {
  readonly kind: ApiRequestErrorKind
  readonly status?: number
  readonly code?: string
  readonly fields?: Record<string, string[]>
  readonly cause?: unknown

  constructor({ kind, message, status, code, fields, cause }: ApiRequestErrorOptions) {
    super(message)

    this.name = "ApiRequestError"
    this.kind = kind
    this.status = status
    this.code = code
    this.fields = fields
    this.cause = cause
  }
}
