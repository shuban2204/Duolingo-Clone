import Link from "next/link";
import { Apple as AppleIcon } from "lucide-react";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  switchHref: "/login" | "/signup";
  switchLabel: string;
};

export function AuthLayout({ children, switchHref, switchLabel }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <Link className="auth-close" href="/" aria-label="Close and return home">×</Link>
      <Link className="auth-switch" href={switchHref}>{switchLabel}</Link>
      <section className="auth-panel">{children}</section>
    </main>
  );
}

export function AuthDivider() {
  return <div className="auth-divider"><span /> <b>OR</b> <span /></div>;
}

export function AuthLegal() {
  return (
    <div className="auth-legal">
      <p>By signing in to Duolingo, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p>
      <p>This site is protected by reCAPTCHA Enterprise and the Google <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a> apply.</p>
    </div>
  );
}

export function SocialButton({ provider, wide = true }: { provider: "Google" | "Facebook" | "Apple"; wide?: boolean }) {
  return (
    <button className={`auth-social ${wide ? "" : "auth-social-half"}`} type="button" disabled aria-label={`${provider} sign-in unavailable in this demo`}>
      {provider === "Apple" ? <AppleIcon className="social-apple" aria-hidden="true" fill="currentColor" /> : <span className={`social-mark ${provider.toLowerCase()}`}>{provider === "Google" ? "G" : "f"}</span>}
      <span>{wide ? "SIGN IN WITH " : ""}{provider.toUpperCase()}</span>
    </button>
  );
}
