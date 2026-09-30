import * as z from "zod"

export const workoutSectionSchema = z.enum(["warmup", "main"])

export const repetitionTargetSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("fixed"),
      value: z.number().int().positive()
    }),
    z.object({
      type: z.literal("range"),
      minimum: z.number().int().positive(),
      maximum: z.number().int().positive()
    }),
    z.object({
      type: z.literal("duration"),
      seconds: z.number().int().positive()
    })
  ])
  .refine((target) => target.type !== "range" || target.maximum >= target.minimum, {
    error: "O máximo deve ser maior ou igual ao mínimo.",
    path: ["maximum"]
  })

export type WorkoutSection = z.infer<typeof workoutSectionSchema>
export type RepetitionTarget = z.infer<typeof repetitionTargetSchema>
