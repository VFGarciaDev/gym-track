import type { WorkoutApiResponse } from "@/api/queries/workouts/get-workout-details/schema"
import type { RepetitionTarget, WorkoutSection } from "@/types/workout"

type WorkoutExercise = WorkoutApiResponse["exercises"][number]
type WorkoutSet = WorkoutExercise["sets"][number]

export const workoutDetailsMock: WorkoutApiResponse[] = [
  {
    id: "treino-superior",
    name: "Treino de Superiores",
    restSeconds: 60,
    exercises: [
      createExercise(
        "treino-superior",
        "manguito-rot-externa",
        "Manguito Rot. Externa",
        "warmup",
        0,
        2,
        {
          type: "fixed",
          value: 10
        }
      ),
      createExercise(
        "treino-superior",
        "manguito-rot-interna",
        "Manguito Rot. Interna",
        "warmup",
        1,
        2,
        {
          type: "fixed",
          value: 10
        }
      ),
      createExercise(
        "treino-superior",
        "manguito-rot-ombro-abduzido",
        "Manguito Rot. c/ Ombro abduzido",
        "warmup",
        2,
        2,
        { type: "fixed", value: 10 }
      ),
      createExercise(
        "treino-superior",
        "puxador-articulado-invertido",
        "Puxador Articulado Invertido",
        "main",
        0,
        3,
        { type: "fixed", value: 15 }
      ),
      createExercise(
        "treino-superior",
        "remada-sentada-fechada",
        "Remada Sentada Fechada",
        "main",
        1,
        3,
        { type: "fixed", value: 15 }
      ),
      createExercise(
        "treino-superior",
        "desenvolvimento-banco-halter",
        "Desenvolvimento Banco - halter",
        "main",
        2,
        3,
        { type: "fixed", value: 15 }
      ),
      createExercise(
        "treino-superior",
        "rosca-direta-barra-w",
        "Rosca direta barra W",
        "main",
        3,
        3,
        { type: "fixed", value: 15 }
      ),
      createExercise("treino-superior", "elevacao-lateral", "Elevação Lateral", "main", 4, 3, {
        type: "fixed",
        value: 15
      }),
      createExercise(
        "treino-superior",
        "supino-inclinado-articulado",
        "Supino Inclinado Articulado",
        "main",
        5,
        3,
        { type: "fixed", value: 15 }
      )
    ],
    lastPerformedAt: null,
    createdAt: "2026-09-30T12:00:00.000Z",
    updatedAt: "2026-09-30T12:00:00.000Z"
  },
  {
    id: "treino-perna",
    name: "Treino de Perna",
    restSeconds: 60,
    exercises: [
      createExercise(
        "treino-perna",
        "terra-sumo-barra-livre",
        "Terra Sumo - Barra Livre",
        "main",
        0,
        4,
        {
          type: "fixed",
          value: 10
        }
      ),
      createExercise(
        "treino-perna",
        "levantamento-terra-barra",
        "Levantamento Terra - Barra",
        "main",
        1,
        2,
        { type: "fixed", value: 10 }
      ),
      createExercise(
        "treino-perna",
        "agachamento-livre-barra",
        "Agachamento Livre - Barra",
        "main",
        2,
        3,
        { type: "fixed", value: 10 }
      ),
      createExercise("treino-perna", "afundo-bulgaro", "Afundo Bulgaro", "main", 3, 3, {
        type: "fixed",
        value: 10
      }),
      createExercise("treino-perna", "stiff-polia", "Stiff - polia", "main", 4, 4, {
        type: "fixed",
        value: 10
      }),
      createExercise("treino-perna", "prancha-isometrica", "Prancha Isometrica", "main", 5, 3, {
        type: "duration",
        seconds: 60
      })
    ],
    lastPerformedAt: "2026-09-29T12:00:00.000Z",
    createdAt: "2026-09-30T12:00:00.000Z",
    updatedAt: "2026-09-30T12:00:00.000Z"
  }
]

function createExercise(
  workoutId: string,
  exerciseSlug: string,
  name: string,
  section: WorkoutSection,
  position: number,
  setCount: number,
  repetitionTarget: RepetitionTarget
): WorkoutExercise {
  const workoutExerciseId = `${workoutId}-${exerciseSlug}`

  return {
    id: workoutExerciseId,
    exercise: {
      id: `exercise-${exerciseSlug}`,
      name,
      source: "catalog"
    },
    section,
    position,
    notes: null,
    sets: createSets(workoutExerciseId, setCount, repetitionTarget)
  }
}

function createSets(
  workoutExerciseId: string,
  setCount: number,
  repetitionTarget: RepetitionTarget
): WorkoutSet[] {
  return Array.from({ length: setCount }, (_, position) => ({
    id: `${workoutExerciseId}-set-${position + 1}`,
    position,
    repetitionTarget: { ...repetitionTarget },
    loadKg: null
  }))
}
