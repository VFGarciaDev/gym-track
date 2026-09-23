import z from "zod"

export const userSchema = z.object({
  name: z.string(),
  email: z.string(),
  taxId: z.string(),
})

export type User = z.infer<typeof userSchema>

export type UserSession = {
  accessToken: string
  user: User
}
