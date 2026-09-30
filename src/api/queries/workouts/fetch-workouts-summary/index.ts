import type { WorkoutsSummaryApiResponse } from "./schema"

import { normalizeApiError } from "@/lib/errors/normalize-api-error"
import { workoutsSummaryMock } from "@/lib/mocks/workouts-summary"
import { api } from "@/lib/services/api"

import { workoutsSummaryApiResponseSchema } from "./schema"

export async function fetchWorkoutsSummary(): Promise<WorkoutsSummaryApiResponse> {
  return (
    Promise.resolve(workoutsSummaryMock)
      // api.get("/workouts")
      .then((response) => workoutsSummaryApiResponseSchema.parse(response.data))
      .catch((error) => {
        throw normalizeApiError(error)
      })
  )
}
