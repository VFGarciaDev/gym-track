export type RepetitionTarget =
  | {
      type: "fixed"
      value: number
    }
  | {
      type: "range"
      minimum: number
      maximum: number
    }

export type ExerciseSource = "catalog" | "private"
export type WorkoutSection = "warmup" | "main"
