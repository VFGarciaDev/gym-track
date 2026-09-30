import * as z from "zod"

import { exerciseSourceSchema } from "@/types/exercise"
import { repetitionTargetSchema, workoutSectionSchema } from "@/types/workout"

const workoutSetSchema = z.object({
  id: z.string().min(1),
  position: z.number().int().nonnegative(),
  repetitionTarget: repetitionTargetSchema,
  loadKg: z.number().nonnegative().nullable()
})

const workoutExerciseSchema = z.object({
  id: z.string().min(1),
  exercise: z.object({
    id: z.string().min(1),
    name: z.string().trim().min(1),
    source: exerciseSourceSchema
  }),
  section: workoutSectionSchema,
  position: z.number().int().nonnegative(),
  notes: z.string().nullable(),
  sets: z.array(workoutSetSchema).min(1)
})

export const workoutApiResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  restSeconds: z.number().int().nonnegative(),
  exercises: z.array(workoutExerciseSchema),
  lastPerformedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

export type WorkoutApiResponse = z.infer<typeof workoutApiResponseSchema>
