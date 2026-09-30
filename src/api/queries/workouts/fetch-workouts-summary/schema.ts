import * as z from "zod"

const workoutSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  restSeconds: z.number().int().nonnegative(),
  exercisesCount: z.number().int().nonnegative(),
  lastPerformedAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime()
})

export const workoutsSummaryApiResponseSchema = z.array(workoutSummarySchema)

export type WorkoutsSummaryApiResponse = z.infer<typeof workoutsSummaryApiResponseSchema>
