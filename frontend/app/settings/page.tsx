"use client";

import { AppShell } from "@/components/app-shell";
import { api, getUserId, setUserId } from "@/lib/api";
import type { User } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DemoUser = { id: number; name: string };

function SettingsRail() {
  return <aside className="settings-side"><div className="card settings-links"><b>Account</b><b className="active">Preferences</b><b>Profile</b><b>Notifications</b><b>Courses</b><b>Duolingo for Schools</b><b>Social accounts</b><b>Privacy settings</b></div><div className="card settings-links"><h2>Subscription</h2><b>Choose a plan</b></div><div className="card settings-links"><h2>Support</h2><b>Help Center</b></div></aside>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <label className="preference-row"><b>{label}</b><input className="toggle-input" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="toggle-visual" /></label>;
}

export default function Settings() {
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api<DemoUser[]>("/users") });
  const { data: user } = useQuery({ queryKey: ["settings-user"], queryFn: () => api<User>(`/users/${getUserId()}`) });
  const [animations, setAnimations] = useState(true);
  const [motivation, setMotivation] = useState(true);
  const [editingName, setEditingName] = useState("");
  const currentName = user?.name ?? "";

  const patch = useMutation({
    mutationFn: (body: object) => api(`/users/${getUserId()}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["settings-user"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  const toggleLeaderboard = useMutation({
    mutationFn: () => api(`/dev/users/${getUserId()}/toggle-leaderboard`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["settings-user"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  const chooseTheme = (theme: "light" | "dark") => {
    setTheme(theme);
    patch.mutate({ theme });
  };

  const sound = user?.sound_enabled ?? true;

  return (
    <AppShell showTopStats={false} rightRail={<SettingsRail />}>
      <section className="preferences">
        <h1>Preferences</h1>

        <div className="preference-group">
          <h2>Account profile</h2>
          <label className="select-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <b>Username</b>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "2px solid var(--line)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  fontWeight: 700,
                  fontSize: 15,
                }}
                value={editingName !== "" ? editingName : currentName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Your username"
              />
              <button
                className="raised primary"
                style={{ padding: "8px 16px", fontSize: 13 }}
                onClick={() => {
                  const val = (editingName || currentName).trim();
                  if (val) {
                    patch.mutate({ name: val });
                    localStorage.setItem("duolingo_username", val);
                  }
                }}
              >
                SAVE
              </button>
            </div>
          </label>
        </div>

        <div className="preference-group">
          <h2>Lesson experience</h2>
          <Toggle label="Sound effects" checked={sound} onChange={(value) => patch.mutate({ sound_enabled: value })} />
          <Toggle label="Animations" checked={animations} onChange={setAnimations} />
          <Toggle label="Motivational messages" checked={motivation} onChange={setMotivation} />
          <Toggle label="Listening exercises" checked={sound} onChange={(value) => patch.mutate({ sound_enabled: value })} />
        </div>

        <div className="preference-group">
          <h2>Appearance</h2>
          <label className="select-row">
            <b>Dark mode</b>
            <select value={user?.theme ?? "light"} onChange={(event) => chooseTheme(event.target.value as "light" | "dark")}>
              <option value="dark">ON</option>
              <option value="light">OFF</option>
            </select>
          </label>
        </div>

        <div className="preference-group">
          <h2>Demo account & Leaderboard</h2>
          <label className="select-row">
            <b>Active Learner</b>
            <select
              value={getUserId()}
              onChange={(event) => {
                const newId = Number(event.target.value);
                setUserId(newId);
                const selected = users.find((u) => u.id === newId);
                if (selected) localStorage.setItem("duolingo_username", selected.name);
                queryClient.clear();
                router.push("/learn");
              }}
            >
              {users.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <b style={{ display: "block" }}>Leaderboard Access</b>
              <small className="muted">
                {user?.leaderboard_unlocked
                  ? "Status: Unlocked (10+ lessons completed)"
                  : `Status: Locked (${user?.completed_lessons ?? 0}/10 lessons completed)`}
              </small>
            </div>
            <button
              className="raised"
              style={{ padding: "8px 14px", fontSize: 13, fontWeight: 900 }}
              onClick={() => toggleLeaderboard.mutate()}
            >
              {user?.leaderboard_unlocked ? "LOCK (TEST)" : "UNLOCK (TEST)"}
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
