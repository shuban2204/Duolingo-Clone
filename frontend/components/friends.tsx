"use client";

import { ChevronRight, Copy, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getUserId } from "@/lib/api";
import type { User } from "@/lib/types";
import { TopStats } from "./app-shell";
import { Duo } from "./duo";

export function FriendFaces() {
  return (
    <div className="friend-illustration-wrap" aria-label="Duolingo learners">
      <Image
        src="/FollowingPortionImage.png"
        alt="Duolingo learners"
        className="friend-illustration"
        width={500}
        height={221}
      />
    </div>
  );
}

export function InviteFriendsModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = typeof window === "undefined" ? "https://invite.duolingo.com/DUO-DEMO" : `${window.location.origin}/signup?ref=duo-friend`;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <div className="friend-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="invite-modal card" role="dialog" aria-modal="true" aria-labelledby="invite-title"><button className="invite-close" aria-label="Close invite friends" onClick={onClose}><X /></button><div className="invite-duo"><Duo size={104} state="encourage" /><span>✦</span></div><h1 id="invite-title">Invite friends</h1><p>Tell your friends it&apos;s free and fun to learn a language on Duolingo!</p><div className="invite-link"><span title={inviteUrl}>{inviteUrl}</span><button onClick={copyLink}><Copy />{copied ? "COPIED!" : "COPY LINK"}</button></div><small>Or share on...</small><div className="invite-socials"><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}`} target="_blank" rel="noreferrer">FACEBOOK</a><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent("Learn a language with me!")}`} target="_blank" rel="noreferrer">TWITTER</a></div></section></div>;
}

export function AddFriendsCard({ onInvite }: { onInvite: () => void }) {
  return <div className="card add-friends"><h2>Add friends</h2><Link href="/profile/friends"><Search /><span>Find friends</span><ChevronRight /></Link><button onClick={onInvite}><span className="invite-icon">💌</span><span>Invite friends</span><ChevronRight /></button></div>;
}

export function FriendsRail() {
  const [tab, setTab] = useState<"following" | "followers">("following");
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => api<User>(`/users/${getUserId()}/dashboard`) });
  return <><aside className="profile-side">{user && <TopStats user={user} />}<div className="card social-card"><div className="social-tabs" role="tablist" aria-label="Connections"><button role="tab" aria-selected={tab === "following"} onClick={() => setTab("following")}>FOLLOWING</button><button role="tab" aria-selected={tab === "followers"} onClick={() => setTab("followers")}>FOLLOWERS</button></div><div role="tabpanel"><FriendFaces /><p>{tab === "following" ? "Learning is more fun and effective when you connect with others." : "Share your profile so friends can follow your learning journey."}</p></div></div><AddFriendsCard onInvite={() => setInviteOpen(true)} /><nav className="profile-footer-links">ABOUT　 BLOG　 STORE　 EFFICACY　 CAREERS<br />INVESTORS　 TERMS　 PRIVACY</nav></aside>{inviteOpen && <InviteFriendsModal onClose={() => setInviteOpen(false)} />}</>;
}
