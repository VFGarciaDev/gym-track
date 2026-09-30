import * as z from "zod"

export const exerciseSourceSchema = z.enum(["catalog", "private"])

export type ExerciseSource = z.infer<typeof exerciseSourceSchema>
