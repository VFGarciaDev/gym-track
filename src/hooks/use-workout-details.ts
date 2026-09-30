import { useQuery } from "@tanstack/react-query"

import { getWorkoutDetails } from "@/api/queries/workouts/get-workout-details"

export function useWorkoutDetails(workoutId: string) {
  return useQuery({
    queryKey: ["workout-details", workoutId],
    queryFn: async () => {
      const response = await getWorkoutDetails(workoutId)


    }
  })
}
