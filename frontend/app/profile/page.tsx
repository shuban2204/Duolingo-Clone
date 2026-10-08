"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { FriendsRail } from "@/components/friends";
import { api, getUserId } from "@/lib/api";
import type { User } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { AvatarSVG, DEFAULT_CONFIG, type AvatarConfig } from "./avatar/page";

type ProfileData = { user: User; joined_at: string; weekly_activity: { date: string; xp: number }[]; achievements: { code: string; title: string; description: string; icon: string; earned: boolean }[] };

function achievementProgress(code: string, user: User) {
  if (code === "STREAK_3") return { value: Math.min(user.current_streak, 3), target: 3 };
  if (code === "STREAK_7") return { value: Math.min(user.current_streak, 7), target: 7 };
  if (code === "XP_100") return { value: Math.min(user.total_xp, 100), target: 100 };
  if (code === "XP_500") return { value: Math.min(user.total_xp, 500), target: 500 };
  return { value: 0, target: 1 };
}

export default function Profile() {
  const { data } = useQuery({ queryKey: ["profile"], queryFn: () => api<ProfileData>(`/users/${getUserId()}/profile`) });
  const user = data?.user;
  const joined = data?.joined_at ? new Date(data.joined_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "October 2026";
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);

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
  }, []);

  return <AppShell showTopStats={false} rightRail={<FriendsRail />}>
    <section className="profile-header">
      <div className="profile-cover" style={{ backgroundColor: avatarConfig.bgColor || "#e5e5e5" }}>
        <div className="profile-avatar-display">
          <AvatarSVG config={avatarConfig} size={280} />
        </div>
        <Link href="/profile/avatar" aria-label="Edit profile avatar" className="profile-edit-btn">
          <Pencil size={20} strokeWidth={2.4} />
        </Link>
      </div>
      <h1>{user?.name ?? "Learner"}</h1>
      <p className="profile-handle">{(user?.name ?? "learner").split(" ")[0]}</p>
      <p>Joined {joined}</p>
      <div className="profile-follows"><button>0 Following</button><button>0 Followers</button></div>
      <span className="profile-language"><span className="mini-flag" /></span>
    </section>
    <section className="profile-section"><h2>Statistics</h2><div className="profile-stats"><div><span>🔥</span><b>{user?.current_streak ?? 0}</b><small>Day streak</small></div><div><span>⚡</span><b>{user?.total_xp ?? 0}</b><small>Total XP</small></div><div><span>🛡️</span><b>{user?.league ?? "None"}</b><small>Current league</small></div><div><span>🎖️</span><b>0</b><small>Top 3 finishes</small></div></div></section>
    <section className="profile-section"><header><h2>Achievements</h2><button>VIEW ALL</button></header><div className="achievement-list">{data?.achievements.slice(0, 6).map((achievement) => { const progress = user ? achievementProgress(achievement.code, user) : { value: 0, target: 1 }; return <article key={achievement.code} className={!achievement.earned ? "locked" : ""}><div className="achievement-badge"><span>{achievement.icon}</span><small>LEVEL 1</small></div><div><h3>{achievement.title}</h3><div className="achievement-track"><span style={{ width: `${progress.value / progress.target * 100}%` }} /></div><p>{achievement.description}</p></div><em>{progress.value}/{progress.target}</em></article>; })}</div></section>
  </AppShell>;
}
