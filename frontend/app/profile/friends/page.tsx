"use client";

import { AppShell } from "@/components/app-shell";
import { FriendFaces, InviteFriendsModal } from "@/components/friends";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function FindFriendsPage() {
  const [query, setQuery] = useState("");
  const [following, setFollowing] = useState<number[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api<User[]>("/users") });
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return users.filter((user) => user.name.toLowerCase().includes(term) || `@${user.name.toLowerCase().replaceAll(" ", "")}`.includes(term));
  }, [query, users]);

  return <AppShell rightRail={false} showTopStats={false}><main className="friend-search-page"><h1>Search for friends</h1><label className="friend-search-input"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or username" autoFocus /><span className="sr-only">Search learners</span></label><div className="friend-search-rule" />{query.trim() ? <section className="friend-results" aria-live="polite">{results.length ? results.map((user) => { const active = following.includes(user.id); return <article className="card friend-result" key={user.id}><span>{user.name.slice(0, 1)}</span><div><b>{user.name}</b><small>@{user.name.toLowerCase().replaceAll(" ", "")}</small></div><button className={active ? "following" : ""} onClick={() => setFollowing((items) => active ? items.filter((id) => id !== user.id) : [...items, user.id])}>{active ? "FOLLOWING" : "FOLLOW"}</button></article>; }) : <p className="friend-empty">No learners found. Try another name or username.</p>}</section> : <section className="connect-empty"><div><FriendFaces /><p>Learning is more fun and effective when you connect with others.</p></div><aside><h2>Other ways to connect</h2><button className="card invite-row" onClick={() => setInviteOpen(true)}><span className="invite-mini">🦉</span><span><b>Invite friends</b><small>Tell your friends it&apos;s free and fun to learn a language on Duolingo!</small></span><ChevronRight /></button></aside></section>}</main>{inviteOpen && <InviteFriendsModal onClose={() => setInviteOpen(false)} />}</AppShell>;
}
