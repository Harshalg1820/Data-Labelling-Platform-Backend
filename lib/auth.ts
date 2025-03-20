import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SigninMessage } from "./signin-message"
import prisma from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Solana",
      credentials: {
        signature: {
          label: "Signature",
          type: "text",
        },
        publicKey: {
          label: "Public Key",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.publicKey || !credentials?.signature) {
            return null
          }

          // Verify the signature
          const signinMessage = new SigninMessage(JSON.parse(credentials.signature))
          const verified = await signinMessage.verify(credentials.publicKey, credentials.signature)

          if (!verified) {
            return null
          }

          // Get or create user
          let user = await prisma.user.findUnique({
            where: {
              walletAddress: credentials.publicKey,
            },
          })

          if (!user) {
            // Create new user with default role
            user = await prisma.user.create({
              data: {
                walletAddress: credentials.publicKey,
                role: "WORKER", // Default role
              },
            })
          }

          return {
            id: user.id,
            walletAddress: user.walletAddress,
            role: user.role,
          }
        } catch (e) {
          console.error("Error in authorize:", e)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.walletAddress = token.walletAddress as string
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.walletAddress = user.walletAddress
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: "/signin",
  },
}

