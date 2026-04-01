import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      githubId: string
      status: 'pending' | 'approved' | 'rejected'
      isAdmin: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    githubId: string
    status: 'pending' | 'approved' | 'rejected'
    isAdmin: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    githubId: string
    status: 'pending' | 'approved' | 'rejected'
    isAdmin: boolean
  }
}
