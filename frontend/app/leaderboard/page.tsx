"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { api, getUserId } from "@/lib/api";
import type { User } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { AvatarSVG, DEFAULT_CONFIG, type AvatarConfig } from "../profile/avatar/page";

// ==========================================
// League Shield SVGs
// ==========================================

function BronzeShieldSVG() {
  return (
    <svg viewBox="0 0 64 74" width="56" height="65" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e39a5c" />
          <stop offset="45%" stopColor="#c57a3e" />
          <stop offset="100%" stopColor="#965320" />
        </linearGradient>
        <linearGradient id="bronzeFacet" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M 32 3 L 58 10 C 58 42 48 62 32 71 C 16 62 6 42 6 10 Z"
        fill="url(#bronzeGrad)"
        stroke="#783e15"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M 32 8 L 53 14 C 53 39 44 57 32 65 C 20 57 11 39 11 14 Z"
        fill="none"
        stroke="#f6bf8a"
        strokeWidth="2"
        opacity="0.75"
      />
      <path
        d="M 32 8 L 13 14 C 13 39 21 57 32 65 Z"
        fill="url(#bronzeFacet)"
      />
      <circle cx="32" cy="36" r="13" fill="#8f4a1a" opacity="0.4" />
      <path
        d="M 32 27 L 35 33 L 42 34 L 37 39 L 38 46 L 32 42 L 26 46 L 27 39 L 22 34 L 29 33 Z"
        fill="#ffdeba"
      />
    </svg>
  );
}

function LockedShieldSVG({
  type,
}: {
  type: "silver" | "gold" | "sapphire";
}) {
  const colors = {
    silver: {
      grad1: "#cbd5e1",
      grad2: "#94a3b8",
      grad3: "#64748b",
      stroke: "#475569",
      inner: "#e2e8f0",
    },
    gold: {
      grad1: "#fef08a",
      grad2: "#eab308",
      grad3: "#a16207",
      stroke: "#854d0e",
      inner: "#fef9c3",
    },
    sapphire: {
      grad1: "#7dd3fc",
      grad2: "#0284c7",
      grad3: "#0369a1",
      stroke: "#075985",
      inner: "#bae6fd",
    },
  }[type];

  return (
    <svg viewBox="0 0 64 74" width="46" height="54" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`shieldGrad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.grad1} />
          <stop offset="50%" stopColor={colors.grad2} />
          <stop offset="100%" stopColor={colors.grad3} />
        </linearGradient>
      </defs>
      <path
        d="M 32 3 L 58 10 C 58 42 48 62 32 71 C 16 62 6 42 6 10 Z"
        fill={`url(#shieldGrad-${type})`}
        stroke={colors.stroke}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 32 8 L 53 14 C 53 39 44 57 32 65 C 20 57 11 39 11 14 Z"
        fill="none"
        stroke={colors.inner}
        strokeWidth="2"
        opacity="0.6"
      />
      <g transform="translate(23, 27)">
        <rect x="2" y="7" width="14" height="12" rx="3" fill="#ffffff" opacity="0.95" />
        <path
          d="M 5 7 V 4 C 5 2 7 0 9 0 C 11 0 13 2 13 4 V 7"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.95"
        />
        <circle cx="9" cy="12" r="1.5" fill="#475569" />
      </g>
    </svg>
  );
}

// ==========================================
// Medal SVGs for Rank 1, 2, 3
// ==========================================

function RankMedalSVG({ rank }: { rank: 1 | 2 | 3 }) {
  if (rank === 1) {
    return (
      <svg viewBox="0 0 36 36" className="rank-medal-svg">
        <defs>
          <linearGradient id="goldMedal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe600" />
            <stop offset="50%" stopColor="#ffc800" />
            <stop offset="100%" stopColor="#e5a500" />
          </linearGradient>
        </defs>
        <path d="M 12 18 L 7 34 L 14 30 L 17 34 L 16 22 Z" fill="#ff4b4b" />
        <path d="M 24 18 L 29 34 L 22 30 L 19 34 L 20 22 Z" fill="#d33131" />
        <circle cx="18" cy="15" r="12" fill="url(#goldMedal)" stroke="#e5a500" strokeWidth="2" />
        <circle cx="18" cy="15" r="9.5" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
        <text
          x="18"
          y="19"
          textAnchor="middle"
          fontSize="12"
          fontWeight="900"
          fill="#875100"
          fontFamily="inherit"
        >
          1
        </text>
      </svg>
    );
  }
  if (rank === 2) {
    return (
      <svg viewBox="0 0 36 36" className="rank-medal-svg">
        <defs>
          <linearGradient id="silverMedal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
        <path d="M 12 18 L 7 34 L 14 30 L 17 34 L 16 22 Z" fill="#3b82f6" />
        <path d="M 24 18 L 29 34 L 22 30 L 19 34 L 20 22 Z" fill="#1d4ed8" />
        <circle cx="18" cy="15" r="12" fill="url(#silverMedal)" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="18" cy="15" r="9.5" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
        <text
          x="18"
          y="19"
          textAnchor="middle"
          fontSize="12"
          fontWeight="900"
          fill="#475569"
          fontFamily="inherit"
        >
          2
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 36 36" className="rank-medal-svg">
      <defs>
        <linearGradient id="bronzeMedal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e39a5c" />
          <stop offset="50%" stopColor="#c57a3e" />
          <stop offset="100%" stopColor="#965320" />
        </linearGradient>
      </defs>
      <path d="M 12 18 L 7 34 L 14 30 L 17 34 L 16 22 Z" fill="#10b981" />
      <path d="M 24 18 L 29 34 L 22 30 L 19 34 L 20 22 Z" fill="#047857" />
      <circle cx="18" cy="15" r="12" fill="url(#bronzeMedal)" stroke="#965320" strokeWidth="2" />
      <circle cx="18" cy="15" r="9.5" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
      <text
        x="18"
        y="19"
        textAnchor="middle"
        fontSize="12"
        fontWeight="900"
        fill="#5a2a07"
        fontFamily="inherit"
      >
        3
      </text>
    </svg>
  );
}

// ==========================================
// Cross-Platform SVG Mini Flags
// ==========================================

function MiniFlagSVG({ flag }: { flag: string }) {
  if (flag === "🇫🇷") {
    return (
      <svg viewBox="0 0 16 12" width="16" height="12" style={{ display: "block", borderRadius: 2 }}>
        <rect width="5.33" height="12" fill="#002395" />
        <rect x="5.33" width="5.34" height="12" fill="#ffffff" />
        <rect x="10.67" width="5.33" height="12" fill="#ed2939" />
      </svg>
    );
  }
  if (flag === "🇩🇪") {
    return (
      <svg viewBox="0 0 16 12" width="16" height="12" style={{ display: "block", borderRadius: 2 }}>
        <rect width="16" height="4" fill="#000000" />
        <rect y="4" width="16" height="4" fill="#dd0000" />
        <rect y="8" width="16" height="4" fill="#ffce00" />
      </svg>
    );
  }
  if (flag === "🇮🇹") {
    return (
      <svg viewBox="0 0 16 12" width="16" height="12" style={{ display: "block", borderRadius: 2 }}>
        <rect width="5.33" height="12" fill="#009246" />
        <rect x="5.33" width="5.34" height="12" fill="#ffffff" />
        <rect x="10.67" width="5.33" height="12" fill="#ce2b37" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 12" width="16" height="12" style={{ display: "block", borderRadius: 2 }}>
      <rect width="16" height="3" fill="#aa151b" />
      <rect y="3" width="16" height="6" fill="#f1bf00" />
      <rect y="9" width="16" height="3" fill="#aa151b" />
    </svg>
  );
}

// ==========================================
// Colorful Illustrated Avatars
// ==========================================

const AVATAR_PALETTES = [
  { bg: "#ffd280", hair: "#5c3317", skin: "#ffb89d", flag: "🇪🇸" },
  { bg: "#cbe5ff", hair: "#312e81", skin: "#e59d65", flag: "🇫🇷" },
  { bg: "#ffd8f0", hair: "#e6b843", skin: "#ffcba3", flag: "🇩🇪" },
  { bg: "#d9f99d", hair: "#1f2427", skin: "#97513f", flag: "🇲🇽" },
  { bg: "#fed7aa", hair: "#7d4223", skin: "#b76e45", flag: "🇬🇧" },
  { bg: "#e9d5ff", hair: "#c95026", skin: "#ffc6b7", flag: "🇧🇷" },
  { bg: "#ccfbf1", hair: "#0f172a", skin: "#a46648", flag: "🇯🇵" },
  { bg: "#fef08a", hair: "#4a2d1e", skin: "#ffe2d6", flag: "🇮🇹" },
  { bg: "#fbcfe8", hair: "#7c2d12", skin: "#6e3d3a", flag: "🇨🇦" },
  { bg: "#bae6fd", hair: "#1e293b", skin: "#f2a07d", flag: "🇺🇸" },
];

function CompanionAvatar({
  index,
  name,
}: {
  index: number;
  name: string;
}) {
  const p = AVATAR_PALETTES[index % AVATAR_PALETTES.length];

  return (
    <div className="leaderboard-avatar-circle" style={{ backgroundColor: p.bg }}>
      <svg viewBox="0 0 44 44" width="44" height="44">
        <ellipse cx="22" cy="46" rx="16" ry="10" fill="#3b82f6" opacity="0.8" />
        <circle cx="22" cy="22" r="12" fill={p.skin} />
        <path
          d={
            index % 3 === 0
              ? "M 10 20 C 10 11 34 11 34 20 C 31 15 26 13 22 13 C 17 13 13 15 10 20 Z"
              : index % 3 === 1
              ? "M 9 23 C 9 8 35 8 35 23 C 33 13 25 12 22 14 C 18 12 11 14 9 23 Z"
              : "M 11 19 C 11 10 33 10 33 19 C 30 16 28 14 22 14 C 16 14 13 16 11 19 Z"
          }
          fill={p.hair}
        />
        <circle cx="18" cy="22" r="1.6" fill="#1f2937" />
        <circle cx="26" cy="22" r="1.6" fill="#1f2937" />
        <path
          d="M 19 26 Q 22 29 25 26"
          fill="none"
          stroke="#1f2937"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="leaderboard-avatar-flag" title={name}>
        <MiniFlagSVG flag={p.flag} />
      </span>
    </div>
  );
}

function UserCustomAvatarCircle({
  config,
}: {
  config: AvatarConfig;
}) {
  return (
    <div
      className="leaderboard-avatar-circle"
      style={{ backgroundColor: config.bgColor || "#e5e5e5" }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          transform: "translateY(22%)",
          pointerEvents: "none",
        }}
      >
        <AvatarSVG config={config} size={58} />
      </div>
      <span className="leaderboard-avatar-flag">
        <MiniFlagSVG flag="🇪🇸" />
      </span>
    </div>
  );
}

// ==========================================
// Right Rail for Leaderboard
// ==========================================

// ==========================================
// Duo Workout & Three Shields SVGs
// ==========================================

function DuoWorkoutSVG() {
  return (
    <svg viewBox="0 0 100 100" width="84" height="84" style={{ overflow: "visible" }}>
      {/* Dumbbell left plate */}
      <g transform="translate(10, 48)">
        <ellipse cx="6" cy="18" rx="6" ry="14" fill="#64748b" stroke="#334155" strokeWidth="2" />
        <ellipse cx="6" cy="18" rx="3.5" ry="9" fill="#94a3b8" />
        <rect x="6" y="15" width="22" height="6" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="26" cy="18" rx="5" ry="12" fill="#64748b" stroke="#334155" strokeWidth="2" />
      </g>

      {/* Duo Body */}
      <ellipse cx="58" cy="56" rx="30" ry="32" fill="#58cc02" />
      <ellipse cx="58" cy="62" rx="22" ry="22" fill="#78d826" />

      {/* Wings */}
      <path
        d="M 32 50 C 22 46, 18 58, 28 66 C 34 70, 40 64, 38 56 Z"
        fill="#46a302"
      />
      <path
        d="M 84 52 C 92 56, 90 68, 80 72 C 74 74, 72 66, 76 58 Z"
        fill="#46a302"
      />

      {/* Sweatband on Duo's head */}
      <g transform="rotate(-6, 58, 32)">
        <rect x="30" y="26" width="56" height="11" rx="4" fill="#e11d48" stroke="#be123c" strokeWidth="1.5" />
        <rect x="32" y="29.5" width="52" height="4" fill="#ffffff" rx="1.5" />
      </g>

      {/* Eyes */}
      <ellipse cx="46" cy="42" rx="10" ry="10" fill="#ffffff" />
      <ellipse cx="70" cy="42" rx="10" ry="10" fill="#ffffff" />
      <ellipse cx="49" cy="42" rx="5.5" ry="5.5" fill="#1e293b" />
      <ellipse cx="73" cy="42" rx="5.5" ry="5.5" fill="#1e293b" />
      <circle cx="51" cy="40" r="2" fill="#ffffff" />
      <circle cx="75" cy="40" r="2" fill="#ffffff" />

      {/* Beak */}
      <polygon points="58,46 52,54 64,54" fill="#ff9600" />
      <polygon points="58,55 54,54 62,54" fill="#e07b00" />

      {/* Feet */}
      <ellipse cx="46" cy="88" rx="8" ry="4.5" fill="#ff9600" />
      <ellipse cx="70" cy="88" rx="8" ry="4.5" fill="#ff9600" />
    </svg>
  );
}

function ThreeShieldsHeroSVG() {
  return (
    <svg viewBox="0 0 240 130" width="220" height="120" style={{ overflow: "visible" }}>
      <defs>
        {/* Bronze Shield Gradients */}
        <linearGradient id="heroBronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e5a067" />
          <stop offset="50%" stopColor="#c57a3e" />
          <stop offset="100%" stopColor="#965320" />
        </linearGradient>
        <linearGradient id="heroBronzeInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3be8a" />
          <stop offset="100%" stopColor="#b66a2f" />
        </linearGradient>

        {/* Gold Shield Gradients */}
        <linearGradient id="heroGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe600" />
          <stop offset="40%" stopColor="#ffc800" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="heroGoldInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff385" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>

        {/* Silver Shield Gradients */}
        <linearGradient id="heroSilver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="heroSilverInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      {/* Sparkles / Diamonds around Gold Shield */}
      <g fill="#ffe600">
        <polygon points="98,16 102,22 108,24 102,26 98,32 94,26 88,24 94,22" />
        <polygon points="120,6 122,11 127,12 122,13 120,18 118,13 113,12 118,11" />
        <polygon points="144,14 147,19 152,20 147,21 144,26 141,21 136,20 141,19" />
        <polygon points="170,42 172,46 177,47 172,48 170,52 168,48 163,47 168,46" />
      </g>

      {/* Left: Bronze Shield (tilted -14deg) */}
      <g transform="translate(68, 62) rotate(-14) translate(-40, -45)">
        <path
          d="M 40 4 C 62 4, 76 16, 76 34 C 76 64, 56 80, 40 88 C 24 80, 4 64, 4 34 C 4 16, 18 4, 40 4 Z"
          fill="url(#heroBronze)"
          stroke="#783e15"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M 40 10 C 58 10, 69 19, 69 34 C 69 58, 52 72, 40 79 C 28 72, 11 58, 11 34 C 11 19, 22 10, 40 10 Z"
          fill="url(#heroBronzeInner)"
          opacity="0.85"
        />
        <path
          d="M 40 10 C 40 10, 40 79, 40 79 C 28 72, 11 58, 11 34 C 11 19, 22 10, 40 10 Z"
          fill="#ffffff"
          opacity="0.18"
        />
      </g>

      {/* Right: Silver Shield (tilted +14deg) */}
      <g transform="translate(172, 62) rotate(14) translate(-40, -45)">
        <path
          d="M 40 4 C 62 4, 76 16, 76 34 C 76 64, 56 80, 40 88 C 24 80, 4 64, 4 34 C 4 16, 18 4, 40 4 Z"
          fill="url(#heroSilver)"
          stroke="#475569"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M 40 10 C 58 10, 69 19, 69 34 C 69 58, 52 72, 40 79 C 28 72, 11 58, 11 34 C 11 19, 22 10, 40 10 Z"
          fill="url(#heroSilverInner)"
          opacity="0.85"
        />
        <path
          d="M 40 10 C 40 10, 40 79, 40 79 C 28 72, 11 58, 11 34 C 11 19, 22 10, 40 10 Z"
          fill="#ffffff"
          opacity="0.25"
        />
      </g>

      {/* Center: Gold Shield (larger, facing forward, with feather emblem) */}
      <g transform="translate(120, 58) translate(-46, -52)">
        <path
          d="M 46 4 C 72 4, 88 17, 88 38 C 88 72, 65 92, 46 100 C 27 92, 4 72, 4 38 C 4 17, 20 4, 46 4 Z"
          fill="url(#heroGold)"
          stroke="#b45309"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 46 11 C 67 11, 80 21, 80 38 C 80 66, 60 83, 46 90 C 32 83, 12 66, 12 38 C 12 21, 25 11, 46 11 Z"
          fill="url(#heroGoldInner)"
          opacity="0.95"
        />
        <path
          d="M 46 11 C 46 11, 46 90, 46 90 C 32 83, 12 66, 12 38 C 12 21, 25 11, 46 11 Z"
          fill="#ffffff"
          opacity="0.22"
        />
        <g transform="translate(46, 50) rotate(-28)">
          <path
            d="M 0 -24 C 8 -16, 9 6, 0 22 C -9 6, -8 -16, 0 -24 Z"
            fill="#d97706"
          />
          <path
            d="M 0 -25 L 0 24"
            stroke="#92400e"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M -5 -6 L 0 -10 M 5 -4 L 0 -8 M -6 4 L 0 0 M 6 6 L 0 2"
            stroke="#b45309"
            strokeWidth="1.2"
          />
        </g>
      </g>
    </svg>
  );
}

// ==========================================
// Leaderboard Right Rail Component
// ==========================================

function LeaderboardRail({
  currentUser,
  currentRank,
  userConfig,
  targetXpGap,
  isLocked,
}: {
  currentUser?: User;
  currentRank: number;
  userConfig: AvatarConfig;
  targetXpGap: number;
  isLocked: boolean;
  remainingLessons: number;
}) {
  if (isLocked) {
    return (
      <aside className="right-rail" style={{ width: 360 }}>
        <div className="card lb-locked-rail-card">
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#52656d",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
              }}
            >
              WHAT ARE LEADERBOARDS?
            </span>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#ffffff",
                margin: "0 0 8px",
                lineHeight: 1.3,
              }}
            >
              Do lessons. Earn XP. Compete.
            </h3>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#9ca3af",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Earn XP through lessons, then compete with players in a weekly leaderboard
            </p>
          </div>
          <div style={{ flexShrink: 0, width: 84, display: "flex", justifyContent: "center" }}>
            <DuoWorkoutSVG />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="right-rail">
      {/* 1. User Summary Card */}
      <div className="card lb-rail-card lb-user-summary-card">
        <div className="lb-user-avatar-wrap">
          <div className="lb-user-avatar-inner" style={{ backgroundColor: userConfig.bgColor || "#e5e5e5" }}>
            <div
              style={{
                width: 90,
                height: 90,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                transform: "translateY(24%)",
                pointerEvents: "none",
              }}
            >
              <AvatarSVG config={userConfig} size={90} />
            </div>
          </div>
        </div>

        <h3 className="lb-user-name">{currentUser?.name ?? "Learner"}</h3>
        <p className="lb-user-rank-label">
          {`Rank: ${currentRank}`}
        </p>

        <div className="lb-quick-stats">
          <div className="lb-stat-chip">
            <span role="img" aria-label="streak">🔥</span>
            <span>{currentUser?.current_streak ?? 0} Days</span>
          </div>
          <div className="lb-stat-chip">
            <span role="img" aria-label="hearts">❤️</span>
            <span>{currentUser?.hearts ?? 5}</span>
          </div>
          <div className="lb-stat-chip">
            <span role="img" aria-label="total xp">⚡</span>
            <span>{currentUser?.total_xp ?? 0} XP</span>
          </div>
        </div>

        <div className="lb-progress-note">
          <p>
            {targetXpGap > 0
              ? `You need ${targetXpGap} XP to reach Rank ${Math.max(1, currentRank - 1)}`
              : "You are currently leading in the promotion zone!"}
          </p>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(25, 100 - (targetXpGap / 100) * 50)
                )}%`,
                background: "#58cc02",
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Earn Your Status Badges */}
      <div className="card lb-rail-card">
        <h3 className="rail-title" style={{ marginBottom: 4 }}>
          <span>Earn Your Status</span>
        </h3>
        <p className="muted" style={{ fontSize: 13, margin: "0 0 12px" }}>
          Collect league achievements as you climb ranks.
        </p>
        <div className="lb-status-grid">
          <div className="lb-status-badge" title="Duo Apprentice">🦉</div>
          <div className="lb-status-badge" title="Week Warrior">🎆</div>
          <div className="lb-status-badge" title="Language Master">🇫🇷</div>
          <div className="lb-status-badge" title="Cool Learner">😎</div>
          <div className="lb-status-badge" title="Sharpshooter">🎯</div>
          <div className="lb-status-badge" title="Gold Podium">🥇</div>
          <div className="lb-status-badge" title="Art Lover">🎨</div>
          <div className="lb-status-badge" title="Gem Collector">💎</div>
        </div>
      </div>

      {/* 3. Super Duolingo Promotion */}
      <div className="card lb-rail-card lb-super-card">
        <div className="lb-super-header">
          <span className="lb-super-word">SUPER</span>
          <Sparkles size={20} color="#00e575" />
        </div>
        <h3>Try Super for Free</h3>
        <p>No ads, personalized practice, and unlimited Legendary challenges!</p>
        <button
          className="lb-super-btn"
          onClick={() =>
            window.alert("Super Duolingo free trial is coming soon in this educational clone.")
          }
        >
          TRY 2 WEEKS FREE
        </button>
      </div>
    </aside>
  );
}

// ==========================================
// Locked Leaderboard Exact Component
// ==========================================

const SKELETON_ROWS = [
  { nameWidth: 70 },
  { nameWidth: 110 },
  { nameWidth: 60 },
  { nameWidth: 135 },
  { nameWidth: 80 },
  { nameWidth: 95 },
  { nameWidth: 68 },
];

function LockedLeaderboardView({
  remaining,
  onUnlockTest,
}: {
  completed: number;
  remaining: number;
  onUnlockTest: () => void;
}) {
  const router = useRouter();

  return (
    <div className="lb-locked-duo-container">
      <div className="lb-three-shields-wrap">
        <ThreeShieldsHeroSVG />
      </div>

      <h1 className="lb-locked-hero-title">Unlock Leaderboards!</h1>
      <p className="lb-locked-hero-subtitle">
        Complete {remaining} more lesson{remaining === 1 ? "" : "s"} to start competing
      </p>

      <button
        className="lb-duo-start-btn"
        onClick={() => router.push("/learn")}
      >
        START A LESSON
      </button>

      {/* Duolingo Ghost Leaderboard Rows */}
      <div className="lb-skeleton-list">
        {SKELETON_ROWS.map((row, idx) => (
          <div key={idx} className="lb-skeleton-row">
            <div className="lb-skeleton-dot" />
            <div className="lb-skeleton-avatar" />
            <div className="lb-skeleton-name" style={{ width: row.nameWidth }} />
            <div className="lb-skeleton-xp" />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 36, textAlign: "center" }}>
        <button
          onClick={onUnlockTest}
          style={{
            fontSize: 11,
            fontWeight: 800,
            background: "transparent",
            border: "1px dashed #37464f",
            color: "#64748b",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          ⚡ Dev Mode: Toggle Leaderboards Unlocked
        </button>
      </div>
    </div>
  );
}


// ==========================================
// Main Leaderboard Page Component
// ==========================================

type BoardEntry = {
  rank: number;
  id: number;
  name: string;
  avatar: string;
  xp: number;
  is_current: boolean;
  zone: string;
};

type BoardData = {
  league: string;
  completed_lessons?: number;
  leaderboard_unlocked?: boolean;
  lessons_to_unlock_leaderboard?: number;
  entries: BoardEntry[];
};

export default function LeaderboardPage() {
  const currentUserId = getUserId();
  const queryClient = useQueryClient();
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);

  // Load customizable avatar config from localStorage
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
    return () => {
      window.removeEventListener("focus", loadAvatar);
      window.removeEventListener("duolingo_avatar_updated", loadAvatar);
    };
  }, []);

  // Fetch current user details
  const { data: user } = useQuery({
    queryKey: ["user", currentUserId],
    queryFn: () => api<User>(`/users/${currentUserId}/dashboard`),
  });

  // Fetch API leaderboard
  const { data: boardData } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api<BoardData>("/leaderboard"),
  });

  // Toggle leaderboard unlocked state (for live evaluation & testing)
  const toggleMutation = useMutation({
    mutationFn: () => api(`/dev/users/${currentUserId}/toggle-leaderboard`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  // Duolingo 10-lesson unlock condition check
  const completedLessons = user?.completed_lessons ?? (boardData?.completed_lessons ?? 0);
  const isUnlocked = user?.leaderboard_unlocked ?? (boardData?.leaderboard_unlocked ?? (completedLessons >= 10));
  const remainingLessons = user?.lessons_to_unlock_leaderboard ?? Math.max(0, 10 - completedLessons);

  // Determine user's real original username
  const activeLearnerName = useMemo(() => {
    if (user?.name) return user.name;
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("duolingo_username");
      if (local) return local;
    }
    return "Learner";
  }, [user?.name]);

  // Assemble full robust leaderboard list
  const entries = useMemo(() => {
    const apiEntries = boardData?.entries ?? [];
    const activeLearnerXp = user?.daily_xp ?? (apiEntries.find((e) => e.is_current)?.xp || 140);

    const list: { id: number; name: string; xp: number; is_current: boolean }[] = [];

    apiEntries.forEach((e) => {
      list.push({
        id: e.id,
        // Always show the learner's genuine username when it's their entry
        name: e.is_current ? activeLearnerName : e.name,
        xp: e.is_current ? activeLearnerXp : e.xp,
        is_current: e.is_current,
      });
    });

    // Ensure active learner is included
    if (!list.some((e) => e.is_current)) {
      list.push({
        id: currentUserId,
        name: activeLearnerName,
        xp: activeLearnerXp,
        is_current: true,
      });
    }

    // Sort descending by XP
    list.sort((a, b) => b.xp - a.xp);

    // Assign final rank
    return list.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  }, [boardData, user, currentUserId, activeLearnerName]);

  const currentRank = entries.find((e) => e.is_current)?.rank ?? 5;
  const rankAboveEntry = entries.find((e) => e.rank === currentRank - 1);
  const targetXpGap = rankAboveEntry
    ? Math.max(10, rankAboveEntry.xp - (entries.find((e) => e.is_current)?.xp || 0))
    : 0;

  return (
    <AppShell
      showTopStats={false}
      rightRail={
        <LeaderboardRail
          currentUser={user}
          currentRank={currentRank}
          userConfig={avatarConfig}
          targetXpGap={targetXpGap}
          isLocked={!isUnlocked}
          remainingLessons={remainingLessons}
        />
      }
    >
      {!isUnlocked ? (
        <LockedLeaderboardView
          completed={completedLessons}
          remaining={remainingLessons}
          onUnlockTest={() => toggleMutation.mutate()}
        />
      ) : (
        <div className="leaderboard-container">
          {/* Top Header with Duolingo League Shields */}
          <header className="leaderboard-header">
            <div className="league-shields-row">
              <div className="league-shield-item active" title="Bronze League">
                <BronzeShieldSVG />
              </div>
              <div className="league-shield-item locked" title="Silver League (Locked)">
                <LockedShieldSVG type="silver" />
              </div>
              <div className="league-shield-item locked" title="Gold League (Locked)">
                <LockedShieldSVG type="gold" />
              </div>
              <div className="league-shield-item locked" title="Sapphire League (Locked)">
                <LockedShieldSVG type="sapphire" />
              </div>
            </div>

            <h1 className="leaderboard-title">Bronze League</h1>
            <p className="leaderboard-subtitle">Top 7 advance to Silver League</p>
            <p className="leaderboard-countdown">6 days</p>

            <div className="leaderboard-divider" />
          </header>

          {/* Leaderboard Entries List */}
          <section className="leaderboard-list" aria-label="League rankings">
            {entries.map((row, index) => {
              const isPromotion = row.rank <= 7;
              const isRank1 = row.rank === 1;
              const isRank2 = row.rank === 2;
              const isRank3 = row.rank === 3;

              return (
                <div key={`${row.id}-${row.rank}`}>
                  <article
                    className={`leaderboard-row ${row.is_current ? "current-user" : ""}`}
                  >
                    {/* Rank Column */}
                    <div className="leaderboard-rank-col">
                      {isRank1 ? (
                        <RankMedalSVG rank={1} />
                      ) : isRank2 ? (
                        <RankMedalSVG rank={2} />
                      ) : isRank3 ? (
                        <RankMedalSVG rank={3} />
                      ) : (
                        <span className={`rank-number ${isPromotion ? "promotion" : ""}`}>
                          {row.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar Column */}
                    <div className="leaderboard-avatar-col">
                      {row.is_current ? (
                        <UserCustomAvatarCircle config={avatarConfig} />
                      ) : (
                        <CompanionAvatar index={index} name={row.name} />
                      )}
                    </div>

                    {/* Name Column (Guaranteed High Contrast and Legibility) */}
                    <div className="leaderboard-name-col">
                      <span className="leaderboard-name">{row.name}</span>
                      {row.is_current && <span className="current-user-pill">YOU</span>}
                    </div>

                    {/* XP Column */}
                    <div className="leaderboard-xp-col">
                      <span className="leaderboard-xp">{row.xp} XP</span>
                    </div>
                  </article>

                  {/* Promotion Cutoff Divider after Rank 7 */}
                  {row.rank === 7 && index < entries.length - 1 && (
                    <div className="promotion-zone-divider">
                      <span className="promotion-line" />
                      <span className="promotion-tag">PROMOTION ZONE</span>
                      <span className="promotion-line" />
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          {/* Subtle Dev Testing Affordance */}
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <button
              className="raised"
              style={{
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 900,
                color: "var(--muted)",
                background: "transparent",
                border: "1px solid var(--line)",
              }}
              onClick={() => toggleMutation.mutate()}
            >
              🔒 Test Mode: Lock Leaderboards (0/10 Lessons)
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
