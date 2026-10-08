"use client";

import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Flame, Gem, Heart, MoreHorizontal, Trophy } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { Duo } from "./duo";

import { DEFAULT_CONFIG, AvatarSVG, type AvatarConfig } from "@/app/profile/avatar/page";

function SidebarAvatarIcon({ config }: { config?: AvatarConfig }) {
  const c = config || DEFAULT_CONFIG;

  return (
    <div
      className="sidebar-avatar-circle"
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        backgroundColor: c.bgColor || "#e5e5e5",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        border: "2px solid #e5e5e5",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          transform: "translateY(24%)",
          pointerEvents: "none",
        }}
      >
        <AvatarSVG config={c} size={58} />
      </div>
    </div>
  );
}

const links = [
  { href: "/learn", label: "Learn", icon: "home" },
  { href: "/leaderboard", label: "Leaderboards", icon: "shield" },
  { href: "/quests", label: "Quests", icon: "quest" },
  { href: "/shop", label: "Shop", icon: "shop" },
  { href: "/profile", label: "Profile", icon: "profile" },
] as const;

function NavIcon({ name, avatarConfig }: { name: typeof links[number]["icon"] | "more"; avatarConfig?: AvatarConfig }) {
  if (name === "home") return <span className="nav-art nav-art-home" aria-hidden="true"><Image src="/LearnIcon.png" alt="" width={40} height={40} /></span>;
  if (name === "shield") return <span className="nav-art nav-art-shield" aria-hidden="true"><Image src="/LeaderboardIcon.png" alt="" width={40} height={40} /></span>;
  if (name === "quest") return <span className="nav-art nav-art-quest" aria-hidden="true"><Image src="/QuestIcon.png" alt="" width={40} height={40} /></span>;
  if (name === "shop") return <span className="nav-art nav-art-shop" aria-hidden="true"><Image src="/ShopIcon.png" alt="" width={40} height={40} /></span>;
  if (name === "profile") return <span className="nav-art nav-art-profile" aria-hidden="true"><SidebarAvatarIcon config={avatarConfig} /></span>;
  if (name === "more") return <span className="nav-art nav-art-more" aria-hidden="true"><MoreHorizontal /></span>;
  return <span className={`nav-art nav-art-${name}`} aria-hidden="true"><i /></span>;
}

export function TopStats({ user }: { user: User }) {
  return <div className="top-stats"><button className="stat" title="Spanish course"><span className="mini-flag" /> <span>{user.course_score}</span></button><button className="stat" title="Current streak" style={{ color: "var(--orange)" }}><Flame fill="currentColor" /> {user.current_streak}</button><button className="stat" title="Gems" style={{ color: "var(--blue)" }}><Gem fill="currentColor" /> {user.gems}</button><Link className="stat" href="/shop" title="Hearts" style={{ color: "var(--red)" }}><Heart fill="currentColor" /> {user.hearts}</Link></div>;
}

function Navigation({ mobile = false }: { mobile?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadAvatar = () => {
      try {
        const saved = localStorage.getItem("duolingo_avatar_config");
        if (saved) {
          setAvatarConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
        }
      } catch {
        // fallback
      }
    };
    loadAvatar();
    window.addEventListener("focus", loadAvatar);
    window.addEventListener("duolingo_avatar_updated", loadAvatar);
    window.addEventListener("storage", loadAvatar);
    return () => {
      window.removeEventListener("focus", loadAvatar);
      window.removeEventListener("duolingo_avatar_updated", loadAvatar);
      window.removeEventListener("storage", loadAvatar);
    };
  }, [path]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMoreOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setMoreOpen(false);
    }, 220);
  };

  const logout = () => { localStorage.removeItem("duolingo-demo-user"); router.push("/login"); };

  return (
    <div className="nav-wrap">
      <nav className={mobile ? "mobile-nav" : "nav"} aria-label="Main navigation">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className={path.startsWith(item.href) ? "active" : ""}>
            <NavIcon name={item.icon} avatarConfig={avatarConfig} />
            <span>{item.label}</span>
          </Link>
        ))}
        {!mobile && (
          <div
            className="more-hover-zone"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ position: "relative" }}
          >
            <button
              className={`more-trigger ${moreOpen ? "active" : ""}`}
              aria-label="More"
              aria-expanded={moreOpen}
              aria-controls="more-menu"
              onFocus={handleMouseEnter}
              onBlur={handleMouseLeave}
            >
              <NavIcon name="more" />
              <span>More</span>
            </button>
            {moreOpen && (
              <div
                id="more-menu"
                className="more-menu"
                role="menu"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <a href="https://englishtest.duolingo.com" target="_blank" rel="noreferrer" role="menuitem">
                  <svg viewBox="0 0 40 40" width="36" height="36" style={{ flexShrink: 0, display: "block" }}>
                    <path
                      d="M 20 2 C 22.5 2 24.5 4.5 27 5.5 C 29.5 6.5 32 6.5 34 8.5 C 36 10.5 36 13 37 15.5 C 38 18 39.5 20 39.5 22.5 C 39.5 25 38 27 37 29.5 C 36 32 36 34.5 34 36.5 C 32 38.5 29.5 38.5 27 39.5 C 24.5 40.5 22.5 38 20 38 C 17.5 38 15.5 40.5 13 39.5 C 10.5 38.5 8 38.5 6 36.5 C 4 34.5 4 32 3 29.5 C 2 27 0.5 25 0.5 22.5 C 0.5 20 2 18 3 15.5 C 4 13 4 10.5 6 8.5 C 8 6.5 10.5 6.5 13 5.5 C 15.5 4.5 17.5 2 20 2 Z"
                      fill="#58cc02"
                    />
                    <ellipse cx="20" cy="22" rx="10" ry="9" fill="#ffffff" />
                    <polygon points="13,15 15,10 18,14" fill="#ffffff" />
                    <polygon points="27,15 25,10 22,14" fill="#ffffff" />
                  </svg>
                  <span>DUOLINGO ENGLISH TEST</span>
                </a>
                <Link href="/settings" role="menuitem">SETTINGS</Link>
                <button role="menuitem" onClick={() => window.alert("Help Center is coming soon in this educational clone.")}>HELP</button>
                <button role="menuitem" onClick={logout}>LOG OUT</button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

export function RightRail({ user }: { user: User }) {
  const goal = Math.min(100, user.daily_xp / user.daily_goal * 100);
  return <aside className="right-rail"><div className="card rail-card"><h3 className="rail-title"><span>Daily goal</span><Link href="/quests">VIEW</Link></h3><div className="rail-progress"><span>⚡</span><div><div className="progress-track"><div className="progress-fill" style={{ width: `${goal}%` }} /></div><p className="muted">{user.daily_xp} / {user.daily_goal} XP</p></div></div></div><div className="card rail-card"><h3 className="rail-title"><span>Gold league</span><Trophy color="var(--yellow)" fill="var(--yellow)" /></h3><p className="muted">You&apos;re competing with 7 other learners this week.</p><Link href="/leaderboard" className="blue-link">VIEW LEAGUE</Link></div><div className="card rail-card"><h3 className="rail-title">🔥 {user.current_streak} day streak</h3><p className="muted">Complete a lesson today to keep your streak alive.</p></div></aside>;
}

export function AppShell({ children, rightRail, showTopStats = true }: { children: ReactNode; rightRail?: ReactNode | false; showTopStats?: boolean }) {
  const { setTheme } = useTheme();
  const { data: user, isLoading } = useQuery({ queryKey: ["user"], queryFn: () => api<User>(`/users/${typeof window === "undefined" ? 1 : Number(localStorage.getItem("duolingo-demo-user") || 1)}/dashboard`) });
  useEffect(() => { if (user?.theme) setTheme(user.theme); }, [setTheme, user?.theme]);
  if (isLoading || !user) return <div className="path-loading"><Duo size={90} state="loading" /><p>Loading your path…</p></div>;
  const rail = rightRail === undefined ? <RightRail user={user} /> : rightRail;
  return <div className="shell"><aside className="sidebar"><Link href="/learn" className="brand"><span>duolingo</span></Link><Navigation /><p className="sidebar-notice">Unofficial educational clone</p></aside><main className="app-main"><div className={`app-grid ${rail === false ? "without-rail" : ""}`}><section>{showTopStats && <TopStats user={user} />}{children}</section>{rail}</div></main><Navigation mobile /></div>;
}
