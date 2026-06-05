"use client";
// components/auth/LoginForm.tsx

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

interface LoginFormProps {
  mode: "login" | "register";
}

export function LoginForm({ mode }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (mode === "register" && !form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Registration failed"); return; }
        toast.success("Account created! Signing you in…");
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      console.log("NextAuth Result:", result);

      if (result?.error) {
        console.log("NextAuth returned error:", result.error);
        toast.error(result.error);
      } else {
        console.log("No error from NextAuth. Checking cookies:", document.cookie);
        // Delay the redirect by 3 seconds so the user can see the console logs!
        setTimeout(() => {
          console.log("Executing hard redirect to /dashboard");
          window.location.href = "/dashboard";
        }, 3000);
      }
    } catch (e: unknown) {
      console.error("Login Exception in catch block:", e);
      toast.error("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }} noValidate>
      {mode === "register" && (
        <Input
          label="Full Name"
          id="register-name"
          type="text"
          placeholder="Ada Lovelace"
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          error={errors.name}
          autoComplete="name"
        />
      )}
      <Input
        label="Email"
        id={mode === "login" ? "login-email" : "register-email"}
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        label="Password"
        id={mode === "login" ? "login-password" : "register-password"}
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
        error={errors.password}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />
      <button
        type="submit"
        id={mode === "login" ? "login-submit" : "register-submit"}
        disabled={loading}
        style={{
          width: "100%",
          height: "44px",
          marginTop: "8px",
          background: loading ? "var(--pine-muted)" : "var(--pine)",
          color: "var(--text-inverse)",
          border: "none",
          borderRadius: "var(--radius-md)",
          fontSize: "15px",
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "background var(--transition-base), transform var(--transition-base)",
          opacity: loading ? 0.8 : 1,
        }}
        onMouseEnter={(e) => {
          if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "var(--pine-hover)";
        }}
        onMouseLeave={(e) => {
          if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "var(--pine)";
        }}
      >
        {loading && (
          <svg
            style={{ width: "16px", height: "16px", animation: "spin 0.7s linear infinite", flexShrink: 0 }}
            viewBox="0 0 24 24" fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {mode === "login" ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
}
