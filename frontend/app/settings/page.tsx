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
  const patch = useMutation({ mutationFn: (body: object) => api(`/users/${getUserId()}`, { method: "PATCH", body: JSON.stringify(body) }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["user"] }); queryClient.invalidateQueries({ queryKey: ["settings-user"] }); } });
  const chooseTheme = (theme: "light" | "dark") => { setTheme(theme); patch.mutate({ theme }); };
  const sound = user?.sound_enabled ?? true;
  return <AppShell showTopStats={false} rightRail={<SettingsRail />}><section className="preferences"><h1>Preferences</h1><div className="preference-group"><h2>Lesson experience</h2><Toggle label="Sound effects" checked={sound} onChange={(value) => patch.mutate({ sound_enabled: value })} /><Toggle label="Animations" checked={animations} onChange={setAnimations} /><Toggle label="Motivational messages" checked={motivation} onChange={setMotivation} /><Toggle label="Listening exercises" checked={sound} onChange={(value) => patch.mutate({ sound_enabled: value })} /></div><div className="preference-group"><h2>Appearance</h2><label className="select-row"><b>Dark mode</b><select value={user?.theme ?? "light"} onChange={(event) => chooseTheme(event.target.value as "light" | "dark")}><option value="dark">ON</option><option value="light">OFF</option></select></label></div><div className="preference-group"><h2>Demo account</h2><label className="select-row"><b>Learner</b><select value={getUserId()} onChange={(event) => { setUserId(Number(event.target.value)); queryClient.clear(); router.push("/learn"); }}>{users.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div></section></AppShell>;
}
