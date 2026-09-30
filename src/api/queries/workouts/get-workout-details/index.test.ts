import type { ApiRequestError } from "@/lib/errors/api-request-error"

import { describe, expect, it } from "vitest"

import { getWorkoutDetails } from "."
import { workoutApiResponseSchema } from "./schema"

const workout = {
  id: "workout-1",
  name: "Treino de Costas",
  restSeconds: 90,
  exercises: [
    {
      id: "workout-exercise-1",
      exercise: {
        id: "exercise-1",
        name: "Puxada frontal",
        source: "catalog"
      },
      section: "main",
      position: 0,
      notes: "Manter o tronco estável.",
      sets: [
        {
          id: "workout-set-1",
          position: 0,
          repetitionTarget: { type: "fixed", value: 12 },
          loadKg: 40
        },
        {
          id: "workout-set-2",
          position: 1,
          repetitionTarget: { type: "range", minimum: 8, maximum: 10 },
          loadKg: null
        }
      ]
    }
  ],
  lastPerformedAt: null,
  createdAt: "2026-09-30T12:00:00.000Z",
  updatedAt: "2026-09-30T12:00:00.000Z"
}

describe("workout API response schema", () => {
  it("accepts repetitions and loads configured independently for each set", () => {
    expect(workoutApiResponseSchema.parse(workout)).toEqual(workout)
  })

  it.each([0, null])("accepts %s as a set load", (loadKg) => {
    const response = structuredClone(workout)
    response.exercises[0]!.sets[0]!.loadKg = loadKg

    expect(workoutApiResponseSchema.safeParse(response).success).toBe(true)
  })

  it("rejects a negative set load", () => {
    const response = structuredClone(workout)
    response.exercises[0]!.sets[0]!.loadKg = -1

    expect(workoutApiResponseSchema.safeParse(response).success).toBe(false)
  })

  it("rejects an inverted repetition range in a set", () => {
    const response = structuredClone(workout)
    response.exercises[0]!.sets[1]!.repetitionTarget = {
      type: "range",
      minimum: 12,
      maximum: 8
    }

    expect(workoutApiResponseSchema.safeParse(response).success).toBe(false)
  })

  it.each([
    { field: "restSeconds", value: -1 },
    { field: "createdAt", value: "not-a-date" },
    { field: "updatedAt", value: "not-a-date" }
  ])("rejects an invalid $field", ({ field, value }) => {
    expect(workoutApiResponseSchema.safeParse({ ...workout, [field]: value }).success).toBe(false)
  })

  it("rejects a decimal exercise position", () => {
    const response = structuredClone(workout)
    response.exercises[0]!.position = 1.5

    expect(workoutApiResponseSchema.safeParse(response).success).toBe(false)
  })

  it("rejects an exercise without sets", () => {
    const response = structuredClone(workout)
    response.exercises[0]!.sets = []

    expect(workoutApiResponseSchema.safeParse(response).success).toBe(false)
  })
})

describe("getWorkoutDetails", () => {
  it("resolves a validated workout whose id matches the requested workout", async () => {
    const response = await getWorkoutDetails("treino-superior")

    expect(response.id).toBe("treino-superior")
    expect(response.exercises[0]?.sets[0]).toMatchObject({
      repetitionTarget: { type: "fixed" },
      loadKg: null
    })
  })

  it("normalizes a missing workout as invalidResponse", async () => {
    const result = getWorkoutDetails("treino-inexistente")

    await expect(result).rejects.toMatchObject({
      kind: "invalidResponse"
    } satisfies Partial<ApiRequestError>)
  })
})
