"use client";

import { Duo } from "@/components/duo";
import { api, setUserId } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

type DemoUser = { id: number; name: string; avatar: string; total_xp: number };

export default function Landing() {
  const router = useRouter();
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api<DemoUser[]>("/users") });
  const start = (id: number) => { setUserId(id); router.push("/learn"); };

  return (
    <main className="landing">
      <header className="landing-header">
        <Link className="landing-brand" href="/" aria-label="Duolingo home">
          <Duo size={44} />
          <span>duolingo</span>
        </Link>
        <Link className="raised landing-login" href="/login">LOG IN</Link>
      </header>
      <section className="hero">
        <div className="hero-art"><Duo size={250} /></div>
        <div className="hero-copy">
          <h1>The free, fun, and effective way to learn a language!</h1>
          <div className="landing-actions">
            <Link className="raised primary" href="/signup">Get started</Link>
            <Link className="raised landing-secondary" href="/login">I already have an account</Link>
          </div>
          <div id="learners" className="user-picker">
            {users.slice(0, 8).map((user) => (
              <button aria-label={`Continue as ${user.name}`} className="raised user-chip" key={user.id} onClick={() => start(user.id)}>
                <b>{user.name}</b><br /><small className="muted">{user.total_xp} XP</small>
              </button>
            ))}
          </div>
        </div>
      </section>
      <footer className="disclaimer">Unofficial educational clone built for a full-stack engineering assignment.</footer>
    </main>
  );
}
