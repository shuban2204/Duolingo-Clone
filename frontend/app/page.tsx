"use client";

import { Duo } from "@/components/duo";
import { setUserId } from "@/lib/api";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const siteLanguages = [
  ["🇸🇦", "العربية"], ["🇮🇳", "বাংলা"], ["🇨🇿", "Čeština"], ["🇩🇪", "Deutsch"],
  ["🇬🇷", "Ελληνικά"], ["🇺🇸", "English"], ["🇪🇸", "Español"], ["🇫🇷", "Français"],
  ["🇮🇳", "हिन्दी"], ["🇭🇺", "Magyar"], ["🇮🇩", "Bahasa Indonesia"], ["🇮🇹", "Italiano"],
  ["🇯🇵", "日本語"], ["🇮🇳", "ಕನ್ನಡ"], ["🇰🇷", "한국어"], ["🇮🇳", "मराठी"],
  ["🇳🇱", "Nederlands"], ["🇮🇳", "ਪੰਜਾਬੀ"], ["🇵🇱", "Polski"], ["🇧🇷", "Português"],
  ["🇷🇴", "Română"], ["🇷🇺", "Русский"], ["🇸🇪", "Svenska"], ["🇮🇳", "தமிழ்"],
  ["🇮🇳", "తెలుగు"], ["🇹🇭", "ภาษาไทย"], ["🇵🇭", "Tagalog"], ["🇹🇷", "Türkçe"],
  ["🇺🇦", "Українська"], ["🇵🇰", "اُردُو"], ["🇻🇳", "Tiếng Việt"], ["🇨🇳", "中文"],
] as const;

const courses = [
  ["", "English"], ["♜", "Chess"], ["÷×", "Math"], ["", "Spanish"],
  ["", "French"], ["", "German"], ["", "Italian"], ["", "Portuguese"],
] as const;

function HeroCast() {
  return (
    <div className="landing-cast">
      <Image
        className="landing-cast-image"
        src="/hero-cast.png"
        alt="Duo and Duolingo characters flying together"
        width={848}
        height={848}
        priority
      />
    </div>
  );
}

export default function Landing() {
  const router = useRouter();
  const startDemo = () => {
    setUserId(1);
    router.push("/learn");
  };

  return (
    <main className="landing">
      <header className="landing-header">
        <Link className="landing-brand" href="/" aria-label="Duolingo home">
          <Duo size={39} />
          <span>duolingo</span>
        </Link>
        <details className="language-menu">
          <summary>SITE LANGUAGE: ENGLISH <ChevronDown size={18} aria-hidden="true" /></summary>
          <div className="language-panel">
            {siteLanguages.map(([flag, language]) => (
              <button key={language} type="button"><span aria-hidden="true">{flag}</span>{language}</button>
            ))}
          </div>
        </details>
      </header>

      <section className="hero">
        <div className="hero-art"><HeroCast /></div>
        <div className="hero-copy">
          <h1>The most fun way to learn<br className="desktop-break" /> languages, chess, and more!</h1>
          <div className="landing-actions">
            <Link className="raised primary" href="/signup">GET STARTED</Link>
            <Link className="raised landing-secondary" href="/login">I ALREADY HAVE AN ACCOUNT</Link>
          </div>
        </div>
      </section>

      <nav className="course-carousel" aria-label="Available subjects">
        <button className="course-arrow" type="button" aria-label="Previous subjects"><ChevronLeft /></button>
        <div className="course-list">
          {courses.map(([icon, label]) => label === "Spanish" ? (
            <button key={label} className="course-item" type="button" onClick={startDemo} aria-label="Continue as Aarav">
              <span className={`course-badge course-badge-${label.toLowerCase()}`} aria-hidden="true">{icon}</span>{label}
            </button>
          ) : (
            <Link key={label} className="course-item" href="/onboarding">
              <span className={`course-badge course-badge-${label.toLowerCase()}`} aria-hidden="true">{icon}</span>{label}
            </Link>
          ))}
        </div>
        <button className="course-arrow" type="button" aria-label="Next subjects"><ChevronRight /></button>
      </nav>
    </main>
  );
}
