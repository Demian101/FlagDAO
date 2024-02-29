import { Akord } from "@akord/akord-js"
import { createContext } from "react"

interface PageContext {
	num: number
	// supabase: any
	// user: null | User
	// secretKey: null | string
	// unverifiedSecretKey: null | string
	// setUser: (user: null | User) => void
	// setSecretKey: (secretKey: null | string) => void
	// setUnverifiedSecretKey: (unverifiedSecretKey: null | string) => void
	// loading: boolean
}

export const PageContext = createContext<PageContext>({
	num: 0
  // supabase: null,
	// secretKey: null,
	// unverifiedSecretKey: null,
	// setUser: (user) => {},
	// setSecretKey: (secretKey) => {},
	// setUnverifiedSecretKey: (unverifiedSecretKey) => {},
	// loading: true,
})
