import type { WorkoutsSummaryApiResponse } from "./schema"

import { normalizeApiError } from "@/lib/errors/normalize-api-error"
import { api } from "@/lib/services/api"

import { workoutsSummaryApiResponseSchema } from "./schema"

export async function fetchWorkoutsSummary(): Promise<WorkoutsSummaryApiResponse> {
  return api
    .get("/workouts")
    .then((response) => workoutsSummaryApiResponseSchema.parse(response.data))
    .catch((error) => {
      throw normalizeApiError(error)
    })
}
