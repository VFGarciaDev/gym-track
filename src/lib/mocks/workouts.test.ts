import { describe, expect, it } from "vitest"

import { workoutsSummaryApiResponseSchema } from "@/api/queries/workouts/fetch-workouts-summary/schema"
import { workoutApiResponseSchema } from "@/api/queries/workouts/get-workout-details/schema"

import { workoutDetailsMock } from "./workout"
import { workoutsSummaryMock } from "./workouts-summary"

describe("workout mocks", () => {
  it("keeps every workout detail and summary inside their API contracts", () => {
    expect(
      workoutDetailsMock.every((workout) => workoutApiResponseSchema.safeParse(workout).success)
    ).toBe(true)
    expect(workoutsSummaryApiResponseSchema.safeParse(workoutsSummaryMock.data).success).toBe(true)
  })

  it("contains the complete upper-body workout", () => {
    const workout = workoutDetailsMock.find(({ id }) => id === "treino-superior")

    expect(
      workout?.exercises.filter(({ section }) => section === "warmup").map(getExerciseName)
    ).toEqual(["Manguito Rot. Externa", "Manguito Rot. Interna", "Manguito Rot. c/ Ombro abduzido"])
    expect(
      workout?.exercises.filter(({ section }) => section === "main").map(getExerciseName)
    ).toEqual([
      "Puxador Articulado Invertido",
      "Remada Sentada Fechada",
      "Desenvolvimento Banco - halter",
      "Rosca direta barra W",
      "Elevação Lateral",
      "Supino Inclinado Articulado"
    ])
    expect(workout?.exercises.map(({ sets }) => sets.length)).toEqual([2, 2, 2, 3, 3, 3, 3, 3, 3])
  })

  it("contains the complete leg workout with timed plank sets", () => {
    const workout = workoutDetailsMock.find(({ id }) => id === "treino-perna")

    expect(workout?.exercises.map(getExerciseName)).toEqual([
      "Terra Sumo - Barra Livre",
      "Levantamento Terra - Barra",
      "Agachamento Livre - Barra",
      "Afundo Bulgaro",
      "Stiff - polia",
      "Prancha Isometrica"
    ])
    expect(workout?.exercises.map(({ sets }) => sets.length)).toEqual([4, 2, 3, 3, 4, 3])
    expect(workout?.exercises.at(-1)?.sets.map(({ repetitionTarget }) => repetitionTarget)).toEqual(
      [
        { type: "duration", seconds: 60 },
        { type: "duration", seconds: 60 },
        { type: "duration", seconds: 60 }
      ]
    )
  })

  it("keeps every initial load empty", () => {
    const loads = workoutDetailsMock.flatMap(({ exercises }) =>
      exercises.flatMap(({ sets }) => sets.map(({ loadKg }) => loadKg))
    )

    expect(loads.every((load) => load === null)).toBe(true)
  })

  it("derives the main exercise counts in the workout summaries", () => {
    expect(
      workoutsSummaryMock.data.map(({ id, exercisesCount }) => ({ id, exercisesCount }))
    ).toEqual([
      { id: "treino-superior", exercisesCount: 6 },
      { id: "treino-perna", exercisesCount: 6 }
    ])
  })
})

function getExerciseName({ exercise }: (typeof workoutDetailsMock)[number]["exercises"][number]) {
  return exercise.name
}
