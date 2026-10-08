"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api, getUserId } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export const SKIN_TONES = [
  "#6e3d3a", "#7d4a3f", "#8c4a25", "#97513f", "#985c30", "#a46648",
  "#b76e45", "#c6775c", "#e18e70", "#e59d65", "#f2a07d", "#ffb89d",
  "#ffc6b7", "#ffcba3", "#ffe2d6"
];

export const HAIR_COLORS = [
  "#1f2427", "#4a2d1e", "#7d4223", "#e6b843", "#c95026", "#a770cf", "#2ab5f6", "#ffffff"
];

export const CLOTHING_OPTIONS = [
  { id: "lavender", name: "Lilac Sweater", sweater: "#b782c2", collar: "#a470af", pants: "#9b3ebb" },
  { id: "duo-green", name: "Duo Green", sweater: "#58cc02", collar: "#46a302", pants: "#235390" },
  { id: "navy", name: "Navy Crew", sweater: "#1cb0f6", collar: "#1899d6", pants: "#15252c" },
  { id: "coral", name: "Coral Zip", sweater: "#ff4b4b", collar: "#d33131", pants: "#4b4b4b" },
  { id: "sunny", name: "Sunny Gold", sweater: "#ffc800", collar: "#e5a500", pants: "#6a40a8" },
  { id: "charcoal", name: "Charcoal", sweater: "#4b4b4b", collar: "#373737", pants: "#1899d6" },
];

export const BACKGROUND_COLORS = [
  { id: "default", color: "#e5e5e5", name: "Neutral Grey" },
  { id: "duo", color: "#e5f8cc", name: "Spring Green" },
  { id: "sky", color: "#ddf4ff", name: "Sky Blue" },
  { id: "sunset", color: "#ffe7e5", name: "Sunset Rose" },
  { id: "lemon", color: "#fff7cf", name: "Lemon" },
  { id: "lavender", color: "#f3e8ff", name: "Pastel Violet" },
];

export type AvatarConfig = {
  skinTone: string;
  headShape: "square" | "round" | "oval";
  expression: "happy" | "smile" | "cool" | "wink" | "open";
  hairStyle: "bald" | "short" | "curly" | "afro" | "spiky" | "bob" | "wavy" | "ponytail";
  hairColor: string;
  glasses: "none" | "round" | "square" | "sunglasses";
  facialHair: "none" | "mustache" | "beard" | "goatee";
  hat: "none" | "beanie" | "cap" | "beret";
  clothing: string;
  bgColor: string;
};

export const DEFAULT_CONFIG: AvatarConfig = {
  skinTone: "#6e3d3a",
  headShape: "square",
  expression: "happy",
  hairStyle: "bald",
  hairColor: "#1f2427",
  glasses: "none",
  facialHair: "none",
  hat: "none",
  clothing: "lavender",
  bgColor: "#e5e5e5",
};

export function AvatarSVG({ config, size = 320, viewBox }: { config: AvatarConfig; size?: number; viewBox?: string }) {
  const currentClothing = CLOTHING_OPTIONS.find((c) => c.id === config.clothing) || CLOTHING_OPTIONS[0];

  const headRx = config.headShape === "round" ? 55 : config.headShape === "oval" ? 45 : 32;
  const headW = config.headShape === "oval" ? 130 : 142;
  const headX = (280 - headW) / 2;

  // Darker shade for nose & ears shading
  const darkerSkin = "#4d2927";

  return (
    <svg
      viewBox={viewBox || "0 0 280 340"}
      width={size}
      height={viewBox ? size : (size * 340) / 280}
      className="avatar-character-svg"
      style={{ overflow: "hidden", display: "block" }}
    >
      {/* Arms & Hands */}
      <g id="arms">
        {/* Left Arm */}
        <path d="M 58 290 L 75 220 L 98 228 L 78 300 Z" fill={currentClothing.sweater} />
        <circle cx="68" cy="298" r="14" fill={config.skinTone} />
        {/* Right Arm */}
        <path d="M 222 290 L 205 220 L 182 228 L 202 300 Z" fill={currentClothing.sweater} />
        <circle cx="212" cy="298" r="14" fill={config.skinTone} />
      </g>

      {/* Pants & Lower Body */}
      <g id="pants">
        <path d="M 85 275 L 195 275 L 198 340 L 82 340 Z" fill={currentClothing.pants} />
        {/* Belt detail */}
        <line x1="140" y1="275" x2="140" y2="340" stroke="#00000022" strokeWidth="3" />
        <rect x="105" y="275" width="6" height="20" rx="3" fill="#00000028" />
        <rect x="169" y="275" width="6" height="20" rx="3" fill="#00000028" />
      </g>

      {/* Torso / Sweater */}
      <g id="sweater">
        <path
          d="M 88 275 L 75 220 L 98 205 L 182 205 L 205 220 L 192 275 Z"
          fill={currentClothing.sweater}
        />
        {/* Collar / Turtleneck */}
        <rect
          x="116"
          y="188"
          width="48"
          height="22"
          rx="9"
          fill={currentClothing.collar}
        />
      </g>

      {/* Neck */}
      <rect x="122" y="165" width="36" height="30" rx="6" fill={config.skinTone} />

      {/* Ears */}
      <g id="ears">
        <circle cx={headX - 4} cy="142" r="16" fill={config.skinTone} />
        <circle cx={headX - 4} cy="142" r="9" fill={darkerSkin} opacity="0.4" />
        <circle cx={headX + headW + 4} cy="142" r="16" fill={config.skinTone} />
        <circle cx={headX + headW + 4} cy="142" r="9" fill={darkerSkin} opacity="0.4" />
      </g>

      {/* Head */}
      <rect
        x={headX}
        y="96"
        width={headW}
        height="102"
        rx={headRx}
        fill={config.skinTone}
      />

      {/* Hair Behind / Afro */}
      {config.hairStyle === "afro" && (
        <circle cx="140" cy="130" r="76" fill={config.hairColor} />
      )}

      {/* Eyes & Expression */}
      <g id="expression">
        {config.expression === "wink" ? (
          <>
            {/* Left Eye Open */}
            <rect x="110" y="126" width="26" height="38" rx="13" fill="#ffffff" />
            <ellipse cx="123" cy="145" rx="8" ry="11" fill="#1e1818" />
            <circle cx="126" cy="140" r="3" fill="#ffffff" />
            {/* Right Eye Wink */}
            <path d="M 148 145 Q 160 135 172 145" stroke="#1e1818" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </>
        ) : config.expression === "cool" ? (
          <>
            <rect x="110" y="126" width="26" height="38" rx="13" fill="#ffffff" />
            <ellipse cx="123" cy="145" rx="8" ry="11" fill="#1e1818" />
            <circle cx="126" cy="140" r="3" fill="#ffffff" />
            <rect x="146" y="126" width="26" height="38" rx="13" fill="#ffffff" />
            <ellipse cx="159" cy="145" rx="8" ry="11" fill="#1e1818" />
            <circle cx="162" cy="140" r="3" fill="#ffffff" />
            {/* Cool Eyebrows */}
            <line x1="108" y1="120" x2="136" y2="124" stroke="#1e1818" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="174" y1="120" x2="146" y2="124" stroke="#1e1818" strokeWidth="3.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Normal / Happy Eyes */}
            <rect x="110" y="126" width="26" height="38" rx="13" fill="#ffffff" />
            <ellipse cx="124" cy="145" rx="8" ry="11" fill="#1e1818" />
            <circle cx="127" cy="140" r="3" fill="#ffffff" />

            <rect x="146" y="126" width="26" height="38" rx="13" fill="#ffffff" />
            <ellipse cx="158" cy="145" rx="8" ry="11" fill="#1e1818" />
            <circle cx="161" cy="140" r="3" fill="#ffffff" />
          </>
        )}

        {/* Nose */}
        <path d="M 140 152 Q 138 163 144 163" stroke="#2c1615" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Mouth */}
        {config.expression === "open" ? (
          <path d="M 132 173 Q 140 188 150 173 Z" fill="#ff4b4b" stroke="#1e1818" strokeWidth="3" />
        ) : (
          <path d="M 132 173 Q 141 181 150 173" stroke="#2c1615" strokeWidth="4" strokeLinecap="round" fill="none" />
        )}
      </g>

      {/* Facial Hair */}
      {config.facialHair === "mustache" && (
        <path d="M 124 169 Q 140 162 141 169 Q 142 162 158 169 Q 141 176 124 169 Z" fill="#1f2427" />
      )}
      {config.facialHair === "goatee" && (
        <>
          <path d="M 128 169 Q 140 164 153 169 Q 140 174 128 169 Z" fill="#1f2427" />
          <ellipse cx="141" cy="184" rx="8" ry="6" fill="#1f2427" />
        </>
      )}
      {config.facialHair === "beard" && (
        <path d="M 100 150 Q 140 215 180 150 Q 170 190 140 195 Q 110 190 100 150 Z" fill="#1f2427" />
      )}

      {/* Hair Styles */}
      {config.hairStyle === "short" && (
        <path d="M 88 120 Q 90 80 140 80 Q 190 80 192 120 Q 170 94 140 94 Q 110 94 88 120 Z" fill={config.hairColor} />
      )}
      {config.hairStyle === "curly" && (
        <g fill={config.hairColor}>
          <circle cx="95" cy="98" r="16" />
          <circle cx="118" cy="85" r="17" />
          <circle cx="140" cy="82" r="18" />
          <circle cx="162" cy="85" r="17" />
          <circle cx="185" cy="98" r="16" />
        </g>
      )}
      {config.hairStyle === "spiky" && (
        <polygon points="90,110 105,75 125,95 140,68 155,95 175,75 190,110 140,90" fill={config.hairColor} />
      )}
      {config.hairStyle === "bob" && (
        <path d="M 80 110 Q 90 75 140 75 Q 190 75 200 110 L 202 165 L 186 160 L 188 105 Q 140 92 92 105 L 94 160 L 78 165 Z" fill={config.hairColor} />
      )}
      {config.hairStyle === "ponytail" && (
        <g fill={config.hairColor}>
          <path d="M 90 110 Q 95 82 140 82 Q 185 82 190 110 Q 140 92 90 110 Z" />
          <path d="M 185 92 Q 225 100 215 155 Q 200 140 185 106 Z" />
        </g>
      )}

      {/* Glasses */}
      {config.glasses === "round" && (
        <g stroke="#1e1818" strokeWidth="4" fill="none">
          <circle cx="122" cy="144" r="18" />
          <circle cx="160" cy="144" r="18" />
          <line x1="140" y1="144" x2="142" y2="144" />
        </g>
      )}
      {config.glasses === "square" && (
        <g stroke="#1e1818" strokeWidth="4" fill="none">
          <rect x="104" y="128" width="34" height="30" rx="6" />
          <rect x="144" y="128" width="34" height="30" rx="6" />
          <line x1="138" y1="142" x2="144" y2="142" />
        </g>
      )}
      {config.glasses === "sunglasses" && (
        <g stroke="#15252c" strokeWidth="3" fill="#1a2b32">
          <rect x="102" y="128" width="36" height="32" rx="7" />
          <rect x="144" y="128" width="36" height="32" rx="7" />
          <line x1="138" y1="140" x2="144" y2="140" stroke="#15252c" strokeWidth="4" />
        </g>
      )}

      {/* Hats */}
      {config.hat === "beanie" && (
        <g>
          <path d="M 86 106 Q 90 55 140 55 Q 190 55 194 106 Z" fill="#ff4b4b" />
          <rect x="82" y="98" width="116" height="18" rx="6" fill="#d33131" />
          <circle cx="140" cy="50" r="10" fill="#ffffff" />
        </g>
      )}
      {config.hat === "cap" && (
        <g>
          <path d="M 90 105 Q 92 70 140 70 Q 188 70 190 105 Z" fill="#1cb0f6" />
          <path d="M 80 102 Q 130 96 175 102 L 205 106 L 80 106 Z" fill="#1899d6" />
        </g>
      )}
      {config.hat === "beret" && (
        <path d="M 80 102 Q 85 68 150 68 Q 215 68 200 102 Q 140 90 80 102 Z" fill="#202f36" />
      )}
    </svg>
  );
}

// Category Icons matching the 9 icons in the reference image
function CategoryIcon({ type }: { type: string }) {
  if (type === "skin") {
    // Head shape / skin tone
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="12" width="24" height="20" rx="9" />
        <line x1="15" y1="32" x2="15" y2="35" />
        <line x1="25" y1="32" x2="25" y2="35" />
      </svg>
    );
  }
  if (type === "body") {
    // Child / upper body silhouette
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="13" r="6" />
        <path d="M 11 31 Q 12 22 20 22 Q 28 22 29 31" />
      </svg>
    );
  }
  if (type === "expression") {
    // Eyes & Smile
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="15" r="4.5" />
        <circle cx="26" cy="15" r="4.5" />
        <circle cx="15.5" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="27.5" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <path d="M 16 26 Q 20 30 24 26" />
      </svg>
    );
  }
  if (type === "hair") {
    // Comb
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M 10 14 L 30 24" strokeWidth="5" />
        <line x1="12" y1="15" x2="16" y2="21" />
        <line x1="16" y1="17" x2="20" y2="23" />
        <line x1="20" y1="19" x2="24" y2="25" />
        <line x1="24" y1="21" x2="28" y2="27" />
      </svg>
    );
  }
  if (type === "glasses") {
    // Glasses
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="20" r="6.5" />
        <circle cx="27" cy="20" r="6.5" />
        <line x1="19.5" y1="19" x2="20.5" y2="19" />
        <line x1="6.5" y1="19" x2="4" y2="17" />
        <line x1="33.5" y1="19" x2="36" y2="17" />
      </svg>
    );
  }
  if (type === "facialHair") {
    // Mustache
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M 9 22 Q 15 16 20 20 Q 25 16 31 22 Q 25 28 20 21 Q 15 28 9 22 Z" />
      </svg>
    );
  }
  if (type === "hat") {
    // Beanie
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 10 24 Q 11 14 20 14 Q 29 14 30 24" />
        <rect x="8" y="24" width="24" height="6" rx="2" />
        <circle cx="20" cy="11" r="2.5" />
      </svg>
    );
  }
  if (type === "clothing") {
    // T-shirt
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 14 10 L 7 15 L 10 20 L 13 18 L 13 32 L 27 32 L 27 18 L 30 20 L 33 15 L 26 10 Q 20 14 14 10 Z" />
      </svg>
    );
  }
  if (type === "background") {
    // Picture frame
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="10" width="24" height="20" rx="3" />
        <line x1="8" y1="23" x2="32" y2="23" strokeDasharray="2 2" />
      </svg>
    );
  }
  return null;
}

const CATEGORIES = [
  { id: "skin", name: "Skin tone" },
  { id: "body", name: "Head Shape" },
  { id: "expression", name: "Expression" },
  { id: "hair", name: "Hair style" },
  { id: "glasses", name: "Glasses" },
  { id: "facialHair", name: "Facial hair" },
  { id: "hat", name: "Headwear" },
  { id: "clothing", name: "Clothing" },
  { id: "background", name: "Background" },
];

export default function CreateAvatarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("skin");
  const [config, setConfig] = useState<AvatarConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_CONFIG;

    try {
      const saved = localStorage.getItem("duolingo_avatar_config");
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("duolingo_avatar_config", JSON.stringify(config));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("duolingo_avatar_updated", { detail: config }));
      }
      // Optionally sync to backend
      const userId = getUserId();
      await api(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ avatar: "custom" }),
      }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/profile");
    } catch {
      router.push("/profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="avatar-builder-page">
      {/* Top Header */}
      <header className="avatar-builder-header">
        <Link href="/profile" className="avatar-back-link">
          <ArrowLeft size={24} />
          <span>Create Avatar</span>
        </Link>
      </header>

      {/* Main Container Card */}
      <main className="avatar-builder-card">
        {/* Left Side: Avatar Preview Area */}
        <div
          className="avatar-preview-area"
          style={{ backgroundColor: config.bgColor }}
        >
          <AvatarSVG config={config} size={300} />
        </div>

        {/* Right Side: Customizer Controls */}
        <div className="avatar-controls-area">
          {/* Top Category Tab Bar */}
          <nav className="avatar-category-tabs" aria-label="Avatar customization categories">
            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  className={`avatar-category-tab ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(cat.id)}
                  aria-label={cat.name}
                  aria-pressed={isActive}
                >
                  <CategoryIcon type={cat.id} />
                </button>
              );
            })}
          </nav>

          {/* Options Section */}
          <div className="avatar-options-body">
            <h2 className="avatar-options-title">
              {CATEGORIES.find((c) => c.id === activeTab)?.name}
            </h2>

            {/* Skin Tone Swatches */}
            {activeTab === "skin" && (
              <div className="avatar-swatches-grid">
                {SKIN_TONES.map((color) => {
                  const isSelected = config.skinTone === color;
                  return (
                    <button
                      key={color}
                      className={`avatar-swatch-btn ${isSelected ? "selected" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setConfig({ ...config, skinTone: color })}
                      aria-label={`Skin tone ${color}`}
                    />
                  );
                })}
              </div>
            )}

            {/* Head Shape Options */}
            {activeTab === "body" && (
              <div className="avatar-text-options-grid">
                {[
                  { id: "square", label: "Classic Square" },
                  { id: "round", label: "Round Face" },
                  { id: "oval", label: "Oval Face" },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`avatar-option-pill ${config.headShape === item.id ? "selected" : ""}`}
                    onClick={() => setConfig({ ...config, headShape: item.id as AvatarConfig["headShape"] })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Expression Options */}
            {activeTab === "expression" && (
              <div className="avatar-text-options-grid">
                {[
                  { id: "happy", label: "Happy 😊" },
                  { id: "smile", label: "Gentle Smile 🙂" },
                  { id: "cool", label: "Confident / Cool 😎" },
                  { id: "wink", label: "Winking 😉" },
                  { id: "open", label: "Excited 😃" },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`avatar-option-pill ${config.expression === item.id ? "selected" : ""}`}
                    onClick={() => setConfig({ ...config, expression: item.id as AvatarConfig["expression"] })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Hair Style & Color Options */}
            {activeTab === "hair" && (
              <div className="avatar-hair-section">
                <div className="avatar-text-options-grid">
                  {[
                    { id: "bald", label: "Clean / Bald" },
                    { id: "short", label: "Short Crop" },
                    { id: "curly", label: "Curly Top" },
                    { id: "afro", label: "Full Afro" },
                    { id: "spiky", label: "Spiky" },
                    { id: "bob", label: "Classic Bob" },
                    { id: "ponytail", label: "Ponytail" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      className={`avatar-option-pill ${config.hairStyle === item.id ? "selected" : ""}`}
                      onClick={() => setConfig({ ...config, hairStyle: item.id as AvatarConfig["hairStyle"] })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {config.hairStyle !== "bald" && (
                  <>
                    <h3 className="avatar-options-subtitle">Hair Color</h3>
                    <div className="avatar-swatches-grid">
                      {HAIR_COLORS.map((color) => (
                        <button
                          key={color}
                          className={`avatar-swatch-btn ${config.hairColor === color ? "selected" : ""}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setConfig({ ...config, hairColor: color })}
                          aria-label={`Hair color ${color}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Glasses Options */}
            {activeTab === "glasses" && (
              <div className="avatar-text-options-grid">
                {[
                  { id: "none", label: "None" },
                  { id: "round", label: "Round Frames" },
                  { id: "square", label: "Square Frames" },
                  { id: "sunglasses", label: "Dark Sunglasses" },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`avatar-option-pill ${config.glasses === item.id ? "selected" : ""}`}
                    onClick={() => setConfig({ ...config, glasses: item.id as AvatarConfig["glasses"] })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Facial Hair Options */}
            {activeTab === "facialHair" && (
              <div className="avatar-text-options-grid">
                {[
                  { id: "none", label: "Clean Shaven" },
                  { id: "mustache", label: "Classic Mustache" },
                  { id: "goatee", label: "Goatee" },
                  { id: "beard", label: "Full Beard" },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`avatar-option-pill ${config.facialHair === item.id ? "selected" : ""}`}
                    onClick={() => setConfig({ ...config, facialHair: item.id as AvatarConfig["facialHair"] })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Hat Options */}
            {activeTab === "hat" && (
              <div className="avatar-text-options-grid">
                {[
                  { id: "none", label: "None" },
                  { id: "beanie", label: "Winter Beanie" },
                  { id: "cap", label: "Baseball Cap" },
                  { id: "beret", label: "Beret" },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`avatar-option-pill ${config.hat === item.id ? "selected" : ""}`}
                    onClick={() => setConfig({ ...config, hat: item.id as AvatarConfig["hat"] })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Clothing Options */}
            {activeTab === "clothing" && (
              <div className="avatar-text-options-grid">
                {CLOTHING_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    className={`avatar-option-pill ${config.clothing === item.id ? "selected" : ""}`}
                    onClick={() => setConfig({ ...config, clothing: item.id })}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        backgroundColor: item.sweater,
                        marginRight: 8,
                      }}
                    />
                    {item.name}
                  </button>
                ))}
              </div>
            )}

            {/* Background Backdrop Options */}
            {activeTab === "background" && (
              <div className="avatar-swatches-grid">
                {BACKGROUND_COLORS.map((item) => (
                  <button
                    key={item.id}
                    className={`avatar-swatch-btn ${config.bgColor === item.color ? "selected" : ""}`}
                    style={{ backgroundColor: item.color }}
                    onClick={() => setConfig({ ...config, bgColor: item.color })}
                    aria-label={item.name}
                    title={item.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Action Section */}
      <footer className="avatar-builder-footer">
        <button
          className="avatar-done-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "SAVING..." : "DONE"}
        </button>
      </footer>
    </div>
  );
}
