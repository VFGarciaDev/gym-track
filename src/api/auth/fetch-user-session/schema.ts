import * as z from "zod"

import { userSchema } from "@/types/user-session"

export const userSignInSchema = z.object({
  username: z.string().min(1, { error: "Necessário informar o username." }),
  password: z.string().min(1, { error: "Necessário informar a senha." })
})

export const userSessionApiResponseSchema = z.object({
  user: userSchema
})

export type UserSignInType = z.infer<typeof userSignInSchema>
