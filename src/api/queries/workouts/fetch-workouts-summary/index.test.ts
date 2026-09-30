import { describe, expect, it } from "vitest"

import { workoutsSummaryMock } from "@/lib/mocks/workouts-summary"

import { fetchWorkoutsSummary } from "."
import { workoutsSummaryApiResponseSchema } from "./schema"

const workoutSummary = {
  id: "workout-1",
  name: "Treino de Costas",
  restSeconds: 90,
  exercisesCount: 5,
  lastPerformedAt: null,
  updatedAt: "2026-09-29T12:00:00.000Z"
}

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
  it("resolves with the validated workout summary mock", async () => {
    await expect(fetchWorkoutsSummary()).resolves.toEqual(workoutsSummaryMock.data)
  })
})
