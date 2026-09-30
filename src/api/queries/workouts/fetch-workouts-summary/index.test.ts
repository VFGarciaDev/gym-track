import type { ApiRequestError } from "@/lib/errors/api-request-error"

import { AxiosError, AxiosHeaders } from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { fetchWorkoutsSummary } from "."
import { workoutsSummaryApiResponseSchema } from "./schema"

const dependencies = vi.hoisted(() => ({
  get: vi.fn()
}))

vi.mock("@/lib/services/api", () => ({
  api: { get: dependencies.get }
}))

const workoutSummary = {
  id: "workout-1",
  name: "Treino de Costas",
  restSeconds: 90,
  exercisesCount: 5,
  lastPerformedAt: null,
  updatedAt: "2026-09-29T12:00:00.000Z"
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("workouts summary API response schema", () => {
  it("accepts a direct array of workout summaries", () => {
    expect(workoutsSummaryApiResponseSchema.parse([workoutSummary])).toEqual([workoutSummary])
  })

  it("accepts a null last performed date", () => {
    expect(workoutsSummaryApiResponseSchema.parse([workoutSummary])[0]?.lastPerformedAt).toBeNull()
  })

  it("rejects the legacy split exercise counts", () => {
    expect(
      workoutsSummaryApiResponseSchema.safeParse([
        {
          id: workoutSummary.id,
          name: workoutSummary.name,
          restSeconds: workoutSummary.restSeconds,
          warmupExerciseCount: 2,
          mainExerciseCount: 5,
          lastPerformedAt: workoutSummary.lastPerformedAt,
          updatedAt: workoutSummary.updatedAt
        }
      ]).success
    ).toBe(false)
  })

  it.each([
    { field: "restSeconds", value: -1 },
    { field: "exercisesCount", value: 2.5 },
    { field: "updatedAt", value: "not-a-date" }
  ])("rejects an invalid $field", ({ field, value }) => {
    expect(
      workoutsSummaryApiResponseSchema.safeParse([{ ...workoutSummary, [field]: value }]).success
    ).toBe(false)
  })

  it("rejects a response envelope", () => {
    expect(
      workoutsSummaryApiResponseSchema.safeParse({
        status: "success",
        message: "OK",
        data: [workoutSummary]
      }).success
    ).toBe(false)
  })
})

describe("fetchWorkoutsSummary", () => {
  it("fetches workouts and resolves with the validated response body", async () => {
    dependencies.get.mockResolvedValue({ data: [workoutSummary] })

    await expect(fetchWorkoutsSummary()).resolves.toEqual([workoutSummary])
    expect(dependencies.get).toHaveBeenCalledOnce()
    expect(dependencies.get).toHaveBeenCalledWith("/workouts")
  })

  it("rejects a malformed successful response as invalidResponse", async () => {
    dependencies.get.mockResolvedValue({ data: [{ id: "workout-1" }] })

    await expect(fetchWorkoutsSummary()).rejects.toMatchObject({
      kind: "invalidResponse"
    } satisfies Partial<ApiRequestError>)
  })

  it("rejects an Axios network failure as network", async () => {
    dependencies.get.mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"))

    await expect(fetchWorkoutsSummary()).rejects.toMatchObject({
      kind: "network"
    } satisfies Partial<ApiRequestError>)
  })

  it("preserves a valid backend error response", async () => {
    dependencies.get.mockRejectedValue(
      createAxiosResponseError(
        {
          code: "FORBIDDEN",
          message: "Você não pode acessar estes treinos."
        },
        403
      )
    )

    await expect(fetchWorkoutsSummary()).rejects.toMatchObject({
      kind: "api",
      status: 403,
      code: "FORBIDDEN",
      message: "Você não pode acessar estes treinos."
    } satisfies Partial<ApiRequestError>)
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
