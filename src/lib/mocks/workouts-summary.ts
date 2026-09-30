import type { WorkoutsSummaryApiResponse } from "@/api/queries/workouts/fetch-workouts-summary/schema"

import { workoutDetailsMock } from "./workout"

type WorkoutsSummaryMock = { data: WorkoutsSummaryApiResponse }

export const workoutsSummaryMock: WorkoutsSummaryMock = {
  data: workoutDetailsMock.map(
    ({ id, name, restSeconds, exercises, lastPerformedAt, updatedAt }) => ({
      id,
      name,
      restSeconds,
      exercisesCount: exercises.filter(({ section }) => section === "main").length,
      lastPerformedAt,
      updatedAt
    })
  )
}
