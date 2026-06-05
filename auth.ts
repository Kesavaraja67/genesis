// auth.ts — NextAuth v5 root export (placed at project root)
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth/authOptions";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
