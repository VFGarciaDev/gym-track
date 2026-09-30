import type { WorkoutApiResponse } from "./schema"

import { normalizeApiError } from "@/lib/errors/normalize-api-error"
import { workoutDetailsMock } from "@/lib/mocks/workout"
import { api } from "@/lib/services/api"

import { workoutApiResponseSchema } from "./schema"

export async function getWorkoutDetails(workoutId: string): Promise<WorkoutApiResponse> {
  return (
    Promise.resolve(getWorkoutMock(workoutId))
      // api.get(`/workouts/${workoutId}`)
      .then((response) => workoutApiResponseSchema.parse(response.data))
      .catch((error) => {
        throw normalizeApiError(error)
      })
  )
}

function getWorkoutMock(workoutId: string) {
  return { data: workoutDetailsMock.find((workout) => workout.id === workoutId) }
}
