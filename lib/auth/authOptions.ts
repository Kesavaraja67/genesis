// lib/auth/authOptions.ts
// NextAuth v5 (beta) configuration

import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "../db";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) throw new Error("CredentialsSignin");
        if (!user.passwordHash) {
          throw new Error("CredentialsSignin");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) throw new Error("CredentialsSignin");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      // OAuth providers — check for email conflicts
      const existing = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (existing && existing.provider === "credentials") {
        throw new Error(
          "An account with this email already exists. Please sign in with your password."
        );
      }

      // Upsert OAuth user
      if (!existing) {
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name,
            image: user.image,
            provider: account!.provider,
            providerId: user.id,
          },
        });
      } else if (existing.image !== user.image) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { image: user.image },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
