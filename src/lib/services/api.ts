import type { AxiosInstance } from "axios"

import axios from "axios"

const url = process.env.EXPO_PUBLIC_PROTHEUS_API_URL ?? ""
const prefix = process.env.EXPO_PUBLIC_PROTHEUS_API_URL_PREFIX ?? ""

export const api: AxiosInstance = axios.create({
  baseURL: url + prefix,
  headers: {
    "Content-Type": "application/json",
  },
})
