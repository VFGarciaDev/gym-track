import { useQuery } from "@tanstack/react-query"

import { fetchWorkoutsSummary } from "@/api/queries/workouts/fetch-workouts-summary"

export function useWorkoutsSummary() {
  return useQuery({
    queryKey: ["workouts-summary"],
    queryFn: fetchWorkoutsSummary
  })
}
