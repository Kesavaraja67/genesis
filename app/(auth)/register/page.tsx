// app/(auth)/register/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Genesis account",
};

export default function RegisterPage() {
  redirect("/dashboard");
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-glow">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text font-display">Genesis</h1>
          <p className="text-muted mt-1 text-sm">In the beginning, there was a config.</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Create your account</h2>

          <Suspense fallback={<div style={{height: "200px"}} />}>
            <LoginForm mode="register" />
          </Suspense>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <OAuthButtons />

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary-light transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
