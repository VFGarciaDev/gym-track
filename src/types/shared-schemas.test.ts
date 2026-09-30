import { describe, expect, it } from "vitest"

import { exerciseSourceSchema } from "./exercise"
import { repetitionTargetSchema, workoutSectionSchema } from "./workout"

describe("shared schemas", () => {
  it("accepts catalog and private exercise sources", () => {
    expect(exerciseSourceSchema.parse("catalog")).toBe("catalog")
    expect(exerciseSourceSchema.parse("private")).toBe("private")
  })

  it("accepts warmup and main workout sections", () => {
    expect(workoutSectionSchema.parse("warmup")).toBe("warmup")
    expect(workoutSectionSchema.parse("main")).toBe("main")
  })

  it("accepts a positive integer fixed repetition target", () => {
    expect(repetitionTargetSchema.parse({ type: "fixed", value: 10 })).toEqual({
      type: "fixed",
      value: 10
    })
  })

  it("accepts a positive integer repetition range", () => {
    expect(repetitionTargetSchema.parse({ type: "range", minimum: 8, maximum: 12 })).toEqual({
      type: "range",
      minimum: 8,
      maximum: 12
    })
  })

  it.each([
    { type: "fixed", value: 0 },
    { type: "fixed", value: -1 },
    { type: "fixed", value: 10.5 },
    { type: "range", minimum: 0, maximum: 12 },
    { type: "range", minimum: 8, maximum: -1 },
    { type: "range", minimum: 8.5, maximum: 12 }
  ])("rejects invalid repetition values: $type", (target) => {
    expect(repetitionTargetSchema.safeParse(target).success).toBe(false)
  })

  it("rejects a range whose maximum is below its minimum at maximum", () => {
    const result = repetitionTargetSchema.safeParse({
      type: "range",
      minimum: 12,
      maximum: 8
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["maximum"])
    }
  })
})
