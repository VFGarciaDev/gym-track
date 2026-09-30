import type { ExerciseSource, RepetitionTarget, WorkoutSection } from "."

export type WorkoutSummary = {
  id: string
  name: string
  restSeconds: number
  warmupExerciseCount: number
  mainExerciseCount: number
  lastPerformedAt: string | null
  updatedAt: string
}

export type WorkoutListResponse = {
  items: WorkoutSummary[]
  nextCursor: string | null
}

export type WorkoutExercise = {
  id: string
  exercise: {
    id: string
    name: string
    source: ExerciseSource
  }
  section: WorkoutSection
  position: number
  notes: string | null
  sets: number
  repetitionTarget: RepetitionTarget
}

export type WorkoutDetail = {
  id: string
  name: string
  restSeconds: number
  exercises: WorkoutExercise[]
  createdAt: string
  updatedAt: string
}
