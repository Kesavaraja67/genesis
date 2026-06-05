"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        case "CallbackRouteError":
          return { error: error.cause?.err?.message || "Invalid credentials." };
        default:
          return { error: "Something went wrong during sign in." };
      }
    }
    throw error; // Let Next.js redirect errors bubble up if we used redirect: true
  }
}
