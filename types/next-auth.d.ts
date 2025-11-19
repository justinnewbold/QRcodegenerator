import { DefaultSession } from 'next-auth'
import { Plan } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      plan: Plan
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    plan: Plan
  }
}
