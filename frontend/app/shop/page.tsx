"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Gem, Heart } from "lucide-react";

// ==========================================
// Vector Icons & Illustrations
// ==========================================

function GermanFlagIcon() {
  return (
    <span
      className="german-flag"
      style={{
        width: 36,
        height: 26,
        borderRadius: 6,
        background: "linear-gradient(#000000 0% 33.3%, #dd0000 33.3% 66.6%, #ffce00 66.6% 100%)",
        display: "inline-block",
        border: "2px solid #d4d4d4",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    />
  );
}

// 3D Glossy Red Heart - Scaled to 76px
function RefillHeartIcon() {
  return (
    <svg viewBox="0 0 64 64" width="76" height="76" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="heartRed" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff5e62" />
          <stop offset="50%" stopColor="#ff4b4b" />
          <stop offset="100%" stopColor="#d61b1b" />
        </radialGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#ff4b4b" floodOpacity="0.25" />
        </filter>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#ffebee" opacity="0.85" />
      <path
        d="M 32 50 C 21 41 12 32 12 22 C 12 15.5 16.5 11 23 11 C 27.5 11 30.5 13.8 32 16.5 C 33.5 13.8 36.5 11 41 11 C 47.5 11 52 15.5 52 22 C 52 32 43 41 32 50 Z"
        fill="url(#heartRed)"
        filter="url(#softGlow)"
      />
      {/* Specular Highlight */}
      <ellipse cx="22" cy="17" rx="4.5" ry="3" fill="#ffffff" opacity="0.65" transform="rotate(-30 22 17)" />
    </svg>
  );
}

// Super Infinity Gradient Heart - Scaled to 76px
function UnlimitedHeartIcon() {
  return (
    <svg viewBox="0 0 64 64" width="76" height="76" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="rainbowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00d2ff" />
          <stop offset="35%" stopColor="#00e575" />
          <stop offset="70%" stopColor="#9b51e0" />
          <stop offset="100%" stopColor="#ff2a85" />
        </linearGradient>
        <filter id="superGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#9b51e0" floodOpacity="0.3" />
        </filter>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#f3e8ff" opacity="0.75" />
      <path
        d="M 32 50 C 21 41 12 32 12 22 C 12 15.5 16.5 11 23 11 C 27.5 11 30.5 13.8 32 16.5 C 33.5 13.8 36.5 11 41 11 C 47.5 11 52 15.5 52 22 C 52 32 43 41 32 50 Z"
        fill="url(#rainbowGrad)"
        filter="url(#superGlow)"
      />
      {/* Bold Infinity Symbol */}
      <path
        d="M 23 29 C 19 29 17 31.2 17 33 C 17 34.8 19 37 23 37 C 27.5 37 30 33 32 33 C 34 33 36.5 37 41 37 C 45 37 47 34.8 47 33 C 47 31.2 45 29 41 29 C 36.5 29 34 33 32 33 C 30 33 27.5 29 23 29 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Streak Freeze Ice Crystal - Scaled to 76px
function StreakFreezeIcon() {
  return (
    <svg viewBox="0 0 64 64" width="76" height="76" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="iceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bbf2ff" />
          <stop offset="50%" stopColor="#49c0f8" />
          <stop offset="100%" stopColor="#1cb0f6" />
        </linearGradient>
        <linearGradient id="iceFacet" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Ice Crystal Body */}
      <path
        d="M 32 6 L 49 17 L 54 39 L 39 58 L 25 58 L 10 39 L 15 17 Z"
        fill="url(#iceGrad)"
        filter="drop-shadow(0 5px 8px rgba(28, 176, 246, 0.35))"
      />
      {/* Crystal Facets */}
      <path d="M 32 6 L 49 17 L 32 37 L 15 17 Z" fill="url(#iceFacet)" opacity="0.65" />
      <path d="M 15 17 L 32 37 L 25 58 L 10 39 Z" fill="#1393cf" opacity="0.38" />
      <path d="M 49 17 L 54 39 L 39 58 L 32 37 Z" fill="#1899d6" opacity="0.28" />
      {/* Droplets */}
      <path d="M 22 31 C 22 28 25 24 25 24 C 25 24 28 28 28 31 C 28 33.2 26.5 35 25 35 C 23.5 35 22 33.2 22 31 Z" fill="#ffffff" opacity="0.8" />
      <path d="M 37 42 C 37 39.5 39.5 37 39.5 37 C 39.5 37 42 39.5 42 42 C 42 43.5 40.8 44.8 39.5 44.8 C 38.2 44.8 37 43.5 37 42 Z" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

// Super Duo Flying Mascot in Banner (Matching Image 1)
function SuperDuoFlyingMascot() {
  return (
    <svg viewBox="0 0 130 110" width="125" height="105" style={{ overflow: "visible" }}>
      {/* Neon motion trails / sparkles */}
      <g>
        <path d="M 15 75 Q 35 85 55 78" stroke="#ff3399" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d="M 5 62 Q 25 72 45 65" stroke="#00c9ff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
        <circle cx="12" cy="45" r="3" fill="#ffffff" opacity="0.8" />
        <circle cx="28" cy="88" r="2.5" fill="#ff3399" opacity="0.8" />
        <path d="M 42 22 L 44 26 L 48 27 L 44 28 L 42 32 L 40 28 L 36 27 L 40 26 Z" fill="#ffffff" opacity="0.9" />
      </g>

      {/* Duo Flying Body (Neon Super Palette) */}
      <g transform="translate(35, 12)">
        {/* Glow halo */}
        <ellipse cx="42" cy="44" rx="36" ry="34" fill="#00d2ff" opacity="0.25" filter="blur(8px)" />
        {/* Wings extended */}
        <path d="M 12 36 Q -6 22 4 12 Q 18 20 22 32 Z" fill="#00c3ff" />
        <path d="M 64 36 Q 84 24 82 12 Q 68 18 60 32 Z" fill="#7f53ac" />
        {/* Body Shape */}
        <path
          d="M 16 38 C 16 16 68 16 68 38 C 68 62 58 72 42 72 C 26 72 16 62 16 38 Z"
          fill="url(#superDuoGrad)"
        />
        {/* Face Mask Outline */}
        <path
          d="M 22 34 C 22 22 62 22 62 34 C 62 48 54 54 42 54 C 30 54 22 48 22 34 Z"
          fill="#00e575"
          opacity="0.85"
        />
        {/* Belly patch */}
        <ellipse cx="42" cy="58" rx="14" ry="10" fill="#00d2ff" opacity="0.9" />
        {/* Big Expressive Eyes */}
        <circle cx="33" cy="34" r="9" fill="#ffffff" />
        <circle cx="51" cy="34" r="9" fill="#ffffff" />
        <circle cx="35" cy="34" r="4.5" fill="#18283a" />
        <circle cx="49" cy="34" r="4.5" fill="#18283a" />
        <circle cx="37" cy="32" r="1.8" fill="#ffffff" />
        <circle cx="51" cy="32" r="1.8" fill="#ffffff" />
        {/* Beak */}
        <polygon points="42,39 46,45 38,45" fill="#ffb100" />
      </g>

      <defs>
        <linearGradient id="superDuoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e575" />
          <stop offset="50%" stopColor="#00c3ff" />
          <stop offset="100%" stopColor="#7f53ac" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Locked Leaderboard Shield - Scaled
function LeaderboardShieldLock() {
  return (
    <svg viewBox="0 0 54 62" width="54" height="62" style={{ flexShrink: 0 }}>
      <path
        d="M 27 4 L 48 11 C 48 34 39 50 27 58 C 15 50 6 34 6 11 Z"
        fill="#e5e5e5"
        stroke="#cfd7dc"
        strokeWidth="3.5"
      />
      <circle cx="27" cy="27" r="6" fill="#a5b7c0" />
      <polygon points="24,28 30,28 32,39 22,39" fill="#a5b7c0" />
    </svg>
  );
}

// Duolingo Quest Chest SVG - Scaled
function QuestChestIcon() {
  return (
    <svg viewBox="0 0 32 30" width="34" height="32" style={{ overflow: "visible", flexShrink: 0 }}>
      <rect x="3" y="10" width="26" height="18" rx="3.5" fill="#b06222" stroke="#7d3e09" strokeWidth="2.2" />
      <path d="M 2 10 Q 16 3 30 10 Z" fill="#cf7a30" stroke="#7d3e09" strokeWidth="2.2" />
      <line x1="8" y1="5" x2="8" y2="28" stroke="#f1a83b" strokeWidth="2.8" />
      <line x1="24" y1="5" x2="24" y2="28" stroke="#f1a83b" strokeWidth="2.8" />
      <rect x="13" y="12" width="6" height="7" rx="1.5" fill="#ffd94b" stroke="#7d3e09" strokeWidth="1.2" />
    </svg>
  );
}

// ==========================================
// ==========================================
// Chair Tai Chi Ad Poster (Matching Image 1)
// ==========================================

function ChairTaiChiPoster() {
  return (
    <div className="tai-chi-poster">
      <div className="tai-chi-header">
        <h4 className="tai-chi-main-title">Printable Chair Tai Chi</h4>
        <span className="tai-chi-sub-title">Based on your Age</span>
      </div>
      <div className="tai-chi-grid">
        <div className="tai-chi-box">
          <div className="tai-chi-badge">60 YEARS</div>
          <svg viewBox="0 0 70 82" className="tai-chi-fig">
            <path d="M 22 45 L 22 75 M 48 45 L 48 75 M 18 45 L 52 45 M 18 20 L 18 45" stroke="#795548" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="34" cy="18" r="7" fill="#f0c29e" />
            <path d="M 29 13 Q 34 9 39 13" stroke="#e0e0e0" strokeWidth="3" fill="none" />
            <path d="M 34 25 L 34 45" stroke="#e67e22" strokeWidth="8" strokeLinecap="round" />
            <path d="M 34 28 Q 18 28 12 36" stroke="#e67e22" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="11" cy="36" r="2.5" fill="#f0c29e" />
            <path d="M 34 28 Q 50 30 58 35" stroke="#e67e22" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="59" cy="35" r="2.5" fill="#f0c29e" />
            <path d="M 32 45 L 44 48 L 44 72" stroke="#2c3e50" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 36 45 L 26 48 L 26 72" stroke="#2c3e50" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <ellipse cx="46" cy="73" rx="4" ry="2" fill="#111" />
            <ellipse cx="24" cy="73" rx="4" ry="2" fill="#111" />
          </svg>
        </div>
        <div className="tai-chi-box">
          <div className="tai-chi-badge">65 YEARS</div>
          <svg viewBox="0 0 70 82" className="tai-chi-fig">
            <path d="M 22 45 L 22 75 M 48 45 L 48 75 M 18 45 L 52 45 M 18 20 L 18 45" stroke="#795548" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="34" cy="18" r="7" fill="#e8be96" />
            <path d="M 29 13 Q 34 9 39 13" stroke="#bbb" strokeWidth="3" fill="none" />
            <path d="M 34 25 L 34 45" stroke="#2980b9" strokeWidth="8" strokeLinecap="round" />
            <path d="M 34 28 Q 20 22 17 15" stroke="#2980b9" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="17" cy="15" r="2.5" fill="#e8be96" />
            <path d="M 34 28 Q 48 22 51 15" stroke="#2980b9" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="51" cy="15" r="2.5" fill="#e8be96" />
            <path d="M 32 45 L 44 48 L 44 72" stroke="#34495e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 36 45 L 26 48 L 26 72" stroke="#34495e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <ellipse cx="46" cy="73" rx="4" ry="2" fill="#111" />
            <ellipse cx="24" cy="73" rx="4" ry="2" fill="#111" />
          </svg>
        </div>
        <div className="tai-chi-box">
          <div className="tai-chi-badge">65 YEARS</div>
          <svg viewBox="0 0 70 82" className="tai-chi-fig">
            <path d="M 22 45 L 22 75 M 48 45 L 48 75 M 18 45 L 52 45 M 18 20 L 18 45" stroke="#795548" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="36" cy="18" r="7" fill="#f0c29e" />
            <path d="M 31 13 Q 36 10 41 13" stroke="#e0e0e0" strokeWidth="3" fill="none" />
            <path d="M 35 25 L 33 45" stroke="#27ae60" strokeWidth="8" strokeLinecap="round" />
            <path d="M 34 28 Q 16 34 15 42" stroke="#27ae60" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="15" cy="42" r="2.5" fill="#f0c29e" />
            <path d="M 34 28 Q 50 20 55 14" stroke="#27ae60" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="55" cy="13" r="2.5" fill="#f0c29e" />
            <path d="M 32 45 L 44 48 L 44 72" stroke="#2c3e50" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 36 45 L 26 48 L 26 72" stroke="#2c3e50" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <ellipse cx="46" cy="73" rx="4" ry="2" fill="#111" />
            <ellipse cx="24" cy="73" rx="4" ry="2" fill="#111" />
          </svg>
        </div>
        <div className="tai-chi-box">
          <div className="tai-chi-badge">70+ YEARS</div>
          <svg viewBox="0 0 70 82" className="tai-chi-fig">
            <path d="M 22 45 L 22 75 M 48 45 L 48 75 M 18 45 L 52 45 M 18 20 L 18 45" stroke="#795548" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="34" cy="18" r="7" fill="#f0c29e" />
            <path d="M 29 13 Q 34 9 39 13" stroke="#ffffff" strokeWidth="3" fill="none" />
            <path d="M 34 25 L 34 45" stroke="#8e44ad" strokeWidth="8" strokeLinecap="round" />
            <path d="M 34 28 Q 20 34 14 38" stroke="#8e44ad" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="13" cy="38" r="2.5" fill="#f0c29e" />
            <path d="M 34 28 Q 48 34 54 38" stroke="#8e44ad" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="55" cy="38" r="2.5" fill="#f0c29e" />
            <path d="M 32 45 L 44 48 L 44 72" stroke="#34495e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 36 45 L 26 48 L 26 72" stroke="#34495e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <ellipse cx="46" cy="73" rx="4" ry="2" fill="#111" />
            <ellipse cx="24" cy="73" rx="4" ry="2" fill="#111" />
          </svg>
        </div>
      </div>
      <div className="tai-chi-footer">
        <span className="tai-chi-guide-text">Get your printable Guide</span>
        <span className="tai-chi-logo">m</span>
      </div>
    </div>
  );
}

// Duolingo Footer Links (Matching Image 1)
function ShopFooterLinks() {
  return (
    <footer className="shop-footer-links">
      <a href="#">ABOUT</a>
      <a href="#">BLOG</a>
      <a href="#">STORE</a>
      <a href="#">EFFICACY</a>
      <a href="#">CAREERS</a>
      <a href="#">INVESTORS</a>
      <a href="#">TERMS</a>
      <a href="#">PRIVACY</a>
    </footer>
  );
}

// ==========================================
// Right Rail for Shop
// ==========================================

function ShopRightRail() {
  const [adDismissed, setAdDismissed] = useState(false);

  return (
    <aside className="right-rail shop-rail">
      {/* Top Stats Bar */}
      <div className="shop-stats-bar">
        <div className="shop-stat-pill" title="German Course">
          <GermanFlagIcon />
          <span>1</span>
        </div>
        <div className="shop-stat-pill" style={{ color: "#ff9600" }} title="Day streak">
          <Flame fill="currentColor" size={26} />
          <span>1</span>
        </div>
        <div className="shop-stat-pill" style={{ color: "#1cb0f6" }} title="Gems">
          <Gem fill="currentColor" size={26} />
          <span>505</span>
        </div>
        <div className="shop-stat-pill" style={{ color: "#ff4b4b" }} title="Hearts">
          <Heart fill="currentColor" size={26} />
          <span>5</span>
        </div>
      </div>

      {/* Card 1: Unlock Leaderboards! */}
      <div className="card shop-rail-card">
        <h3 className="shop-rail-title">Unlock Leaderboards!</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <LeaderboardShieldLock />
          <p style={{ margin: 0, fontSize: 16, color: "#777777", lineHeight: 1.45 }}>
            Complete 2 more lessons to start competing
          </p>
        </div>
      </div>

      {/* Card 2: Daily Quests */}
      <div className="card shop-rail-card">
        <div className="shop-rail-title">
          <span>Daily Quests</span>
          <Link href="/quests" style={{ color: "#1cb0f6", fontSize: 14.5, fontWeight: 1000 }}>
            VIEW ALL
          </Link>
        </div>
        <div className="shop-quest-row">
          <span style={{ fontSize: 42, lineHeight: 1, color: "#ffc800" }}>⚡</span>
          <div style={{ flex: 1 }}>
            <b style={{ display: "block", fontSize: 17, color: "#4b4b4b", marginBottom: 8, fontWeight: 1000 }}>
              Earn 10 XP
            </b>
            <div className="shop-quest-bar-wrap">
              <div className="shop-quest-track">
                <span className="shop-quest-text">10 / 10</span>
              </div>
              <QuestChestIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Ad Card ("Printable Chair Tai Chi") */}
      {!adDismissed ? (
        <div className="card shop-ad-card">
          <div className="shop-ad-badges" title="AdChoices">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="#00a0dc" style={{ display: "inline-block" }}>
              <path d="M 2 2 L 14 8 L 2 14 Z" />
              <circle cx="5" cy="8" r="1.5" fill="#ffffff" />
            </svg>
            <span style={{ fontSize: 12, color: "#00a0dc", fontWeight: 700, marginLeft: 2 }}>✕</span>
          </div>

          <ChairTaiChiPoster />

          <button
            className="shop-ad-remove"
            onClick={() => setAdDismissed(true)}
            style={{ background: "transparent", border: 0, cursor: "pointer", marginTop: 14 }}
          >
            REMOVE ADS
          </button>
        </div>
      ) : (
        <div className="card shop-rail-card" style={{ textAlign: "center", padding: 22 }}>
          <p style={{ margin: 0, fontSize: 14, color: "#777" }}>Ads hidden for this session.</p>
        </div>
      )}

      {/* Footer Links */}
      <ShopFooterLinks />
    </aside>
  );
}

// ==========================================
// Main Shop Component
// ==========================================

export default function Shop() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const { data: user } = useQuery<User>({
    queryKey: ["user"],
    queryFn: () =>
      api<User>(
        `/users/${typeof window === "undefined" ? 1 : Number(localStorage.getItem("duolingo-demo-user") || 1)}/dashboard`
      ),
  });

  const purchase = useMutation({
    mutationFn: (item: string) =>
      api("/shop/purchases", { method: "POST", body: JSON.stringify({ item }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  });

  const handleRefillHearts = () => {
    if ((user?.hearts ?? 5) >= 5) {
      setModalMessage("Your hearts are already full! Keep learning without worry.");
      setModalOpen(true);
      return;
    }
    purchase.mutate("HEART_REFILL", {
      onSuccess: () => {
        setModalMessage("Hearts refilled to full!");
        setModalOpen(true);
      },
    });
  };

  const handleSuperModal = () => {
    setModalMessage(
      "Super Duolingo: Enjoy Unlimited Hearts, Personalized Practice, and zero ads! Free 7-day trial starts today."
    );
    setModalOpen(true);
  };

  return (
    <AppShell showTopStats={false} rightRail={user ? <ShopRightRail /> : false}>
      <div className="shop-page">
        {/* Top Banner: Start a 1 week free trial to enjoy exclusive Super benefits (Exact match to Image 1) */}
        <section className="shop-banner">
          <div className="shop-banner-top-row">
            <div className="shop-banner-mascot-wrap">
              <SuperDuoFlyingMascot />
            </div>
            <div className="shop-banner-text-wrap">
              <h1 className="shop-banner-title">
                Start a 1 week free trial to enjoy exclusive Super benefits
              </h1>
            </div>
            <div className="shop-banner-badge-wrap">
              <span className="shop-super-badge">SUPER</span>
            </div>
          </div>
          <button className="shop-banner-btn" onClick={handleSuperModal}>
            START MY FREE 7 DAYS
          </button>
        </section>

        {/* Section: Hearts */}
        <section className="shop-section">
          <h2 className="shop-section-title">Hearts</h2>

          {/* Row 1: Refill Hearts */}
          <div className="shop-item-row">
            <div className="shop-item-left">
              <div className="shop-item-icon">
                <RefillHeartIcon />
              </div>
              <div className="shop-item-info">
                <div className="shop-item-header">
                  <h3 className="shop-item-title">Refill Hearts</h3>
                </div>
                <p className="shop-item-desc">
                  Get full hearts so you can worry less about making mistakes in a lesson
                </p>
              </div>
            </div>
            <button
              className="shop-item-btn disabled"
              onClick={handleRefillHearts}
              disabled={(user?.hearts ?? 5) >= 5}
            >
              FULL
            </button>
          </div>

          {/* Row 2: Unlimited Hearts */}
          <div className="shop-item-row">
            <div className="shop-item-left">
              <div className="shop-item-icon">
                <UnlimitedHeartIcon />
              </div>
              <div className="shop-item-info">
                <div className="shop-item-header">
                  <h3 className="shop-item-title">Unlimited Hearts</h3>
                </div>
                <p className="shop-item-desc">Never run out of hearts with Super!</p>
              </div>
            </div>
            <button className="shop-item-btn trial" onClick={handleSuperModal}>
              FREE TRIAL
            </button>
          </div>
        </section>

        {/* Section: Power-Ups */}
        <section className="shop-section">
          <h2 className="shop-section-title">Power-Ups</h2>

          {/* Row 1: Streak Freeze */}
          <div className="shop-item-row">
            <div className="shop-item-left">
              <div className="shop-item-icon">
                <StreakFreezeIcon />
              </div>
              <div className="shop-item-info">
                <div className="shop-item-header">
                  <h3 className="shop-item-title">Streak Freeze</h3>
                  <span className="shop-item-badge">2 / 2 EQUIPPED</span>
                </div>
                <p className="shop-item-desc">
                  Streak Freeze allows your streak to remain in place for one full day of inactivity.
                </p>
              </div>
            </div>
            <button className="shop-item-btn disabled" disabled>
              EQUIPPED
            </button>
          </div>
        </section>
      </div>

      {/* Info / Promo Modal */}
      {modalOpen && (
        <div
          className="friend-modal-backdrop"
          onClick={() => setModalOpen(false)}
          style={{ zIndex: 999 }}
        >
          <div
            className="card invite-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 460 }}
          >
            <button
              className="invite-close"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div style={{ fontSize: 52, margin: "10px 0" }}>🦉✨</div>
            <h2 style={{ fontSize: 24, margin: "10px 0 15px", color: "#1cb0f6" }}>
              Super Duolingo
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: "#4b4b4b", marginBottom: 25 }}>
              {modalMessage}
            </p>
            <button
              className="raised primary"
              style={{ width: "100%", height: 50, fontSize: 16 }}
              onClick={() => setModalOpen(false)}
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
