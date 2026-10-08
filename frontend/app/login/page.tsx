"use client";

import { AuthDivider, AuthLayout, AuthLegal, SocialButton } from "@/components/auth-layout";
import { api, setUserId } from "@/lib/api";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  identity: z.string().trim().min(2, "Enter your email or username."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function LoginPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = loginSchema.safeParse({ identity, password });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }
    setError("");
    const clean = identity.trim();
    try {
      const users = await api<{ id: number; name: string }[]>("/users");
      const matched = users.find((u) => u.name.toLowerCase() === clean.toLowerCase());
      if (matched) {
        setUserId(matched.id);
        localStorage.setItem("duolingo_username", matched.name);
      } else {
        const newUser = await api<User>("/users", {
          method: "POST",
          body: JSON.stringify({ name: clean }),
        });
        setUserId(newUser.id);
        localStorage.setItem("duolingo_username", newUser.name);
      }
    } catch {
      localStorage.setItem("duolingo_username", clean);
    }
    router.push("/learn");
  }

  return (
    <AuthLayout switchHref="/signup" switchLabel="SIGN UP">
      <h1>Log in</h1>
      <form className="auth-form" onSubmit={submit} noValidate>
        <label className="sr-only" htmlFor="login-identity">Email or username</label>
        <input id="login-identity" autoComplete="username" value={identity} onChange={(event) => setIdentity(event.target.value)} placeholder="Email or username" />
        <div className="auth-password-wrap">
          <label className="sr-only" htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
          <button type="button" className="auth-forgot" onClick={() => setError("Password recovery is coming soon.")}>FORGOT?</button>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-primary" type="submit">LOG IN</button>
      </form>
      <AuthDivider />
      <div className="auth-social-list">
        <SocialButton provider="Google" />
        <SocialButton provider="Facebook" />
        <SocialButton provider="Apple" />
      </div>
      <AuthLegal />
    </AuthLayout>
  );
}
