import GithubProvider from 'next-auth/providers/github'
import { getDb } from '@/lib/db'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  // 反向代理终止 SSL，容器内部是 HTTP，所以 cookie 不需要 Secure 标记
  useSecureCookies: false,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github') {
        const db = getDb()

        const dbUser = db.prepare('SELECT * FROM users WHERE github_id = ?').get(user.id) as any

        if (!dbUser) {
          const isAdmin = user.id === process.env.ADMIN_GITHUB_ID
          const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          const now = new Date().toISOString()

          db.prepare(`
            INSERT INTO users (id, github_id, name, email, image, status, is_admin, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            userId,
            user.id,
            user.name,
            user.email,
            user.image,
            'approved',
            isAdmin ? 1 : 0,
            now,
            now
          )
        }

        return true
      }
      return true
    },
    async jwt({ token }) {
      // 每次都从数据库查最新状态，确保管理员审批后立即生效
      if (token.sub) {
        try {
          const db = getDb()
          const dbUser = db.prepare('SELECT * FROM users WHERE github_id = ?').get(token.sub) as any
          if (dbUser) {
            token.userId = dbUser.id
            token.status = dbUser.status
            token.isAdmin = dbUser.is_admin === 1
          }
        } catch {}
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const db = getDb()
        const dbUser = db.prepare('SELECT * FROM users WHERE github_id = ?').get(token.sub) as any
        if (dbUser) {
          const user = session.user as any
          user.id = dbUser.id
          user.name = dbUser.name
          user.email = dbUser.email
          user.image = dbUser.image
          user.status = dbUser.status
          user.isAdmin = dbUser.is_admin === 1
          user.githubId = token.sub
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
