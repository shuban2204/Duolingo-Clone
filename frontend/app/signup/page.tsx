"use client";

import { AuthDivider, AuthLayout, AuthLegal, SocialButton } from "@/components/auth-layout";
import { api, setUserId } from "@/lib/api";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { z } from "zod";

const ageSchema = z.coerce.number().int().min(3, "Enter a valid age.").max(120, "Enter a valid age.");
const accountSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"age" | "account">("age");
  const [age, setAge] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submitAge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = ageSchema.safeParse(age);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid age.");
      return;
    }
    setError("");
    setStep("account");
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = accountSchema.safeParse({ name, email, password });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }
    setError("");
    const cleanName = name.trim();
    try {
      const newUser = await api<User>("/users", {
        method: "POST",
        body: JSON.stringify({ name: cleanName }),
      });
      setUserId(newUser.id);
      localStorage.setItem("duolingo_username", newUser.name);
    } catch {
      localStorage.setItem("duolingo_username", cleanName);
    }
    router.push("/onboarding");
  }

  return (
    <AuthLayout switchHref="/login" switchLabel="LOGIN">
      {step === "age" ? (
        <>
          <h1>How old are you?</h1>
          <form className="auth-form" onSubmit={submitAge} noValidate>
            <label className="sr-only" htmlFor="signup-age">Age</label>
            <input id="signup-age" inputMode="numeric" autoComplete="off" value={age} onChange={(event) => setAge(event.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Age" />
            <p className="auth-help">Providing your age ensures you get the right Duolingo experience. For more details, please visit our <a href="#">Privacy Policy</a>.</p>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-primary" type="submit">NEXT</button>
          </form>
          <AuthDivider />
          <div className="auth-social-row"><SocialButton provider="Google" wide={false} /><SocialButton provider="Facebook" wide={false} /></div>
        </>
      ) : (
        <>
          <button className="auth-back" type="button" onClick={() => { setStep("age"); setError(""); }}>‹ BACK</button>
          <h1>Create your profile</h1>
          <form className="auth-form" onSubmit={createAccount} noValidate>
            <label className="sr-only" htmlFor="signup-name">Name</label>
            <input id="signup-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
            <label className="sr-only" htmlFor="signup-email">Email</label>
            <input id="signup-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <label className="sr-only" htmlFor="signup-password">Password</label>
            <input id="signup-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-primary" type="submit">CREATE ACCOUNT</button>
          </form>
        </>
      )}
      <AuthLegal />
    </AuthLayout>
  );
}
