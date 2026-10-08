"use client";

import { AnimatedDuo } from "@/components/animated-duo";
import { LessonLoader } from "@/components/lesson-loader";
import { setUserId } from "@/lib/api";
import { ArrowLeft, BarChart3, BookOpen, Check, Compass, Crown, Sigma } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Step = "course" | "level" | "start" | "loading";

const courses = [
  { name: "Spanish", detail: "42M learners", active: true },
  { name: "English", detail: "30M learners" },
  { name: "French", detail: "23M learners" },
  { name: "Chess", detail: "21M learners" },
  { name: "Japanese", detail: "18M learners" },
  { name: "German", detail: "16M learners" },
  { name: "Math", detail: "Build everyday skills" },
  { name: "Hindi", detail: "8M learners" },
];

const levels = ["I’m new to Spanish", "I know some common words", "I can have basic conversations", "I can talk about various topics", "I can discuss most topics in detail"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("course");
  const [course, setCourse] = useState("Spanish");
  const [level, setLevel] = useState(0);
  const [start, setStart] = useState<"scratch" | "placement" | null>(null);

  useEffect(() => {
    if (step !== "loading") return;
    const timer = window.setTimeout(() => { setUserId(1); router.push("/learn"); }, 2600);
    return () => window.clearTimeout(timer);
  }, [router, step]);

  if (step === "loading") {
    return <LessonLoader message="Building your personalized path…" />;
  }

  const progress = step === "course" ? 20 : step === "level" ? 55 : 85;
  const canContinue = step === "course" ? course === "Spanish" : step === "level" ? true : start !== null;
  const goBack = () => step === "course" ? router.push("/signup") : setStep(step === "start" ? "level" : "course");
  const advance = () => setStep(step === "course" ? "level" : step === "level" ? "start" : "loading");

  return (
    <main className="onboarding-page">
      <header className="onboarding-progress"><button onClick={goBack} aria-label="Go back"><ArrowLeft /></button><div><span style={{ width: `${progress}%` }} /></div></header>
      <section className="onboarding-content">
        <div className="onboarding-guide"><AnimatedDuo size={112} /><div className="speech-bubble">{step === "course" ? "What would you like to learn?" : step === "level" ? "Okay, we’ll start fresh!" : "Now let’s find the best place to start!"}</div></div>
        {step === "course" && <div className="onboarding-grid">{courses.map((item) => <button key={item.name} className={`onboarding-card ${course === item.name ? "selected" : ""}`} onClick={() => item.active && setCourse(item.name)} aria-disabled={!item.active}><span className={`course-icon course-${item.name.toLowerCase()}`}>{item.name === "Chess" ? "♜" : item.name === "Math" ? "÷" : ""}</span><span><b>{item.name}</b><small>{item.detail}</small></span>{course === item.name && <Check />}</button>)}</div>}
        {step === "level" && <div className="onboarding-list">{levels.map((item, index) => <button key={item} className={`onboarding-card ${level === index ? "selected" : ""}`} onClick={() => setLevel(index)}><BarChart3 /><b>{item}</b></button>)}</div>}
        {step === "start" && <div className="onboarding-list start-list"><button className={`onboarding-card start-card ${start === "scratch" ? "selected" : ""}`} onClick={() => setStart("scratch")}><BookOpen /><span><b>Start from scratch</b><small>Take the easiest lesson of the Spanish course</small></span></button><button className={`onboarding-card start-card ${start === "placement" ? "selected" : ""}`} onClick={() => setStart("placement")}><Compass /><span><b>Find my level</b><small>Let Duo recommend where you should start learning</small></span></button><div className="onboarding-perks"><span><Crown /> Personalized path</span><span><Sigma /> Skill-aware practice</span></div></div>}
      </section>
      <footer className="onboarding-footer"><button className="onboarding-continue" disabled={!canContinue} onClick={advance}>CONTINUE</button></footer>
    </main>
  );
}
