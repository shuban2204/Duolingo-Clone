"use client";

import { AppShell, TopStats } from "@/components/app-shell";
import { Duo } from "@/components/duo";
import { api } from "@/lib/api";
import type { CoursePath, Skill, User } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, BookOpenText, ChevronLeft, ChevronsRight, Headphones, LockKeyhole, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Lesson = Skill["lessons"][number];
type NodeKind = "star" | "chest" | "duo" | "headphones" | "trophy" | "jump";

const nodeKinds: NodeKind[] = ["star", "star", "star", "duo", "chest", "star", "trophy", "star", "chest"];
const offsets = [0, -52, -82, 132, -52, 0, 0, -48, 32];
const unitColors = ["green", "purple", "teal"];
const unitTitles = ["Order at a café", "Introduce yourself and greet others", "Talk about travel"];

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [right, setRight] = useState(24);
  useEffect(() => {
    const update = () => {
      setVisible(window.scrollY > 420);
      const column = document.querySelector<HTMLElement>(".app-grid > section");
      if (column) setRight(Math.max(18, window.innerWidth - column.getBoundingClientRect().right + 6));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <button className={`back-to-top ${visible ? "visible" : ""}`} style={{ right }} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><ArrowUp /></button>;
}

function PathDuo() {
  return (
    <span className="path-mascot path-duo" role="img" aria-label="Duo bouncing on the learning path">
      <svg viewBox="0 0 140 150" aria-hidden="true">
        <circle className="path-duo-pedestal" cx="70" cy="96" r="51" />
        <circle cx="70" cy="101" r="43" fill="#26373f" opacity=".42" />
        <g className="path-duo-body">
          <path className="path-duo-shape" d="M34 72c-5-23-2-44 9-55C51 9 62 9 70 14c11-7 28-5 36 6 8 11 8 31 3 48 11 5 18 14 19 26-3 12-13 21-25 22-5 13-17 20-33 20-17 0-29-8-34-21-13-1-22-9-25-21 2-11 10-19 23-22Z" />
          <path className="path-duo-mask" d="M39 49c6-17 18-24 30-15 11-10 26-3 32 13 5 15 1 35-8 45-6 7-14 9-23 6-9 3-18 1-24-6-9-10-12-29-7-43Z" />
          <ellipse cx="54" cy="62" rx="16" ry="22" fill="#fff" />
          <ellipse cx="86" cy="62" rx="16" ry="22" fill="#fff" />
          <ellipse cx="59" cy="65" rx="7" ry="11" fill="#3c3c3c" />
          <ellipse cx="81" cy="65" rx="7" ry="11" fill="#3c3c3c" />
          <circle cx="61" cy="61" r="2.5" fill="#fff" /><circle cx="79" cy="61" r="2.5" fill="#fff" />
          <path d="M43 43c7-5 14-6 21-2M77 41c7-4 14-3 20 2" fill="none" stroke="#46a302" strokeWidth="5" strokeLinecap="round" />
          <path className="path-duo-beak" d="M60 79c6-7 14-7 20 0-3 8-7 11-10 11s-7-3-10-11Z" />
          <ellipse className="path-duo-belly" cx="70" cy="112" rx="22" ry="15" />
          <path className="path-duo-wing path-duo-wing-left" d="M35 72C22 75 15 84 14 96c6 9 16 12 27 8Z" />
          <path className="path-duo-wing path-duo-wing-right" d="M106 70c13 4 20 13 20 25-6 9-16 12-27 8Z" />
          <ellipse cx="54" cy="131" rx="11" ry="6" fill="#ff9600" />
          <ellipse cx="87" cy="131" rx="11" ry="6" fill="#ff9600" />
        </g>
      </svg>
    </span>
  );
}

function PathLily() {
  return (
    <span className="path-mascot path-lily" role="img" aria-label="Lily swaying on the learning path">
      <svg viewBox="0 0 170 220" aria-hidden="true">
        <ellipse cx="88" cy="203" rx="55" ry="14" fill="#dedede" />
        <g className="path-lily-body">
          <path d="M50 112 28 126l5 61 21-8 2-48Z" fill="#aaa" />
          <path d="M115 116 142 136l-8 56-23-12 3-47Z" fill="#aaa" />
          <path d="M58 101c-18 18-19 74-3 93h62c15-25 8-76-12-93Z" fill="#b8b8b8" />
          <path d="M69 177h18v31H64l5-31ZM95 177h18l7 31H96l-1-31Z" fill="#8f8f8f" />
          <ellipse cx="88" cy="81" rx="42" ry="46" fill="#d1d1d1" />
          <path d="M45 83C38 28 67 10 103 24c29 11 34 38 22 68-8-15-16-30-25-35-3 37-21 59-51 62 4-13 2-24-4-36Z" fill="#a9a9a9" />
          <path d="M59 81c7 5 14 5 21 0M88 82c7 4 14 3 20-2" fill="none" stroke="#777" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="69" cy="91" rx="5" ry="7" fill="#777" /><ellipse cx="99" cy="90" rx="5" ry="7" fill="#777" />
          <path d="M78 105c9 7 17 7 25 0" fill="none" stroke="#888" strokeWidth="4" strokeLinecap="round" />
          <path d="M55 117 34 109l-7 12 25 18M114 120l25-9 7 12-27 18" fill="none" stroke="#bdbdbd" strokeWidth="12" strokeLinecap="round" />
        </g>
      </svg>
    </span>
  );
}

function PathOscar() {
  return (
    <span className="path-mascot path-oscar" role="img" aria-label="Oscar relaxing with bees on the learning path">
      <svg viewBox="0 0 200 205" aria-hidden="true">
        <ellipse cx="112" cy="174" rx="72" ry="27" fill="#e1e1e1" transform="rotate(-19 112 174)" />
        <g className="path-oscar-body">
          <path d="M54 151c4-45 28-71 66-69 31 2 53 26 50 59-4 37-34 55-75 49-29-5-44-17-41-39Z" fill="#aaa" />
          <path d="M61 142c-19 18-25 44-37 51" fill="none" stroke="#888" strokeWidth="14" strokeLinecap="round" />
          <path d="M92 91c-3-31 16-48 43-43 28 5 39 34 25 61-12 23-41 29-58 13-7-7-10-17-10-31Z" fill="#c2c2c2" />
          <path d="M94 80c1-25 18-40 40-34 19-12 40 3 40 23 16 12 8 35-10 40-4-21-17-35-37-38-11-2-22 1-33 9Z" fill="#8d8d8d" />
          <path d="M119 95c8 3 15 3 22-1M147 99c6 3 11 3 16 0" fill="none" stroke="#777" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="132" cy="103" rx="5" ry="6" fill="#666" /><ellipse cx="157" cy="105" rx="5" ry="6" fill="#666" />
          <path d="M124 115c11-5 22-1 25 10 8-8 19-7 24 2-9 21-39 23-51 4-3-5-2-11 2-16Z" fill="#858585" />
          <path d="M109 130c-12 10-17 21-19 35" fill="none" stroke="#c6c6c6" strokeWidth="13" strokeLinecap="round" />
        </g>
        <g className="path-bee path-bee-one" transform="translate(49 48)"><ellipse rx="11" ry="7" fill="#bbb" /><path d="M-5-6v12M2-6v12" stroke="#888" strokeWidth="3" /><ellipse cx="-5" cy="-9" rx="6" ry="4" fill="#ddd" /><ellipse cx="5" cy="-9" rx="6" ry="4" fill="#ddd" /></g>
        <g className="path-bee path-bee-two" transform="translate(25 92) scale(.82)"><ellipse rx="11" ry="7" fill="#bbb" /><path d="M-5-6v12M2-6v12" stroke="#888" strokeWidth="3" /><ellipse cx="-5" cy="-9" rx="6" ry="4" fill="#ddd" /><ellipse cx="5" cy="-9" rx="6" ry="4" fill="#ddd" /></g>
      </svg>
    </span>
  );
}

function PathMascot({ unitPosition }: { unitPosition: number }) {
  if (unitPosition === 2) return <PathLily />;
  if (unitPosition >= 3) return <PathOscar />;
  return <PathDuo />;
}

function NodeArt({ kind, unitPosition }: { kind: NodeKind; unitPosition: number }) {
  if (kind === "duo") return <PathMascot unitPosition={unitPosition} />;
  if (kind === "chest") return <span className="path-chest" aria-hidden="true"><i /><b /></span>;
  if (kind === "headphones") return <Headphones strokeWidth={3.3} />;
  if (kind === "trophy") return <Trophy fill="currentColor" strokeWidth={2.8} />;
  if (kind === "jump") return <ChevronsRight fill="currentColor" strokeWidth={3.2} />;
  return <Star fill="currentColor" strokeWidth={2.5} />;
}

function LessonNode({ lesson, skill, index, unitLocked, unitPosition, open, onToggle }: { lesson: Lesson; skill: Skill; index: number; unitLocked: boolean; unitPosition: number; open: boolean; onToggle: () => void }) {
  const router = useRouter();
  const completed = lesson.completed || skill.state === "COMPLETED" || lesson.position <= skill.crowns;
  const current = !unitLocked && !completed && skill.state !== "LOCKED" && lesson.position === Math.min(skill.crowns + 1, skill.total_crowns);
  const locked = !completed && !current;
  const jump = unitLocked && index === 0;
  const interactive = completed || current || jump;
  const kind = jump ? "jump" : nodeKinds[index % nodeKinds.length];
  const mascotOffsets = [132, -118, 120];
  const offset = kind === "duo" ? mascotOffsets[Math.min(unitPosition - 1, mascotOffsets.length - 1)] : offsets[index % offsets.length];
  const label = `${skill.title}, lesson ${lesson.position}${jump ? ", jump here" : current ? ", start here" : completed ? ", completed" : ", locked"}`;
  const cardTitle = kind === "trophy" ? `Unit ${unitPosition} review` : unitTitles[unitPosition - 1] ?? skill.title;

  const activate = () => {
    if (interactive) {
      router.push(`/lesson/${lesson.id}`);
      return;
    }
    onToggle();
  };

  return (
    <motion.div className={`lesson-node-wrap kind-${kind} mascot-unit-${unitPosition} ${open ? "node-details-open" : ""}`} style={{ left: `${offset}px` }} initial={{ opacity: 0, scale: 0.88 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-40px" }}>
      {current && <span className="node-callout start">START</span>}
      {jump && <span className="node-callout jump">JUMP HERE?</span>}
      <span className={`node-pedestal ${current ? "current" : ""} ${completed ? "completed" : ""} ${locked ? "locked" : ""} ${jump ? "jump" : ""}`}>
        <motion.button className="path-node" onClick={(event) => { event.stopPropagation(); activate(); }} aria-label={label} aria-expanded={locked ? open : undefined} whileTap={{ y: 6, scale: 0.88 }} transition={{ type: "spring", stiffness: 520, damping: 24 }}>
          <NodeArt kind={kind} unitPosition={unitPosition} />
        </motion.button>
      </span>
      {locked && open && (
        <motion.aside className="node-info-card" role="status" initial={{ opacity: 0, y: -10, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 28 }} onClick={(event) => event.stopPropagation()}>
          <b>{cardTitle}</b>
          <p>Complete all levels above to unlock this!</p>
          <span>LOCKED</span>
        </motion.aside>
      )}
    </motion.div>
  );
}

function LearnRail() {
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => api<User>(`/users/${Number(localStorage.getItem("duolingo-demo-user") || 1)}/dashboard`) });
  if (!user) return null;
  const goal = Math.min(100, user.daily_xp / user.daily_goal * 100);
  return (
    <aside className="right-rail learn-rail">
      <TopStats user={user} />
      <div className="card super-card">
        <span className="super-word">SUPER</span>
        <div className="super-copy"><h3>Try Super for free</h3><p>No ads, personalized practice, and unlimited Legendary!</p></div>
        <div className="super-mascot" aria-hidden="true"><Duo size={76} state="celebrate" /></div>
        <button className="raised super-button" onClick={() => window.alert("Super Duolingo is coming soon in this educational clone.")}>TRY 1 WEEK FREE</button>
      </div>
      <div className="card learn-side-card league-lock-card">
        <h3>Unlock Leaderboards!</h3>
        <div><span className="league-shield">🔒</span><p>Complete 2 more lessons to start competing</p></div>
      </div>
      <div className="card learn-side-card daily-quest-card">
        <h3><span>Daily Quests</span><Link href="/quests">VIEW ALL</Link></h3>
        <div className="quest-row"><span className="quest-bolt">⚡</span><div><b>Earn {user.daily_goal} XP</b><div className="progress-track"><div className="progress-fill" style={{ width: `${goal}%` }} /></div><small>{user.daily_xp} / {user.daily_goal}</small></div><span className="quest-chest">🔐</span></div>
      </div>
      <div className="card practice-promo"><b>Practice makes progress</b><p>Review mistakes and keep your skills strong.</p><Link href="/practice">PRACTICE NOW</Link></div>
      <button className="remove-ads" onClick={() => window.alert("Ad controls are a demo placeholder.")}>REMOVE ADS</button>
      <div className="rail-links"><span>ABOUT</span><span>BLOG</span><span>STORE</span><span>EFFICACY</span><span>CAREERS</span><span>INVESTORS</span><span>TERMS</span><span>PRIVACY</span></div>
    </aside>
  );
}

function CoursePathView({ data }: { data: CoursePath }) {
  const [activeUnitId, setActiveUnitId] = useState(data.units[0]?.id ?? 0);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const activeUnit = data.units.find((unit) => unit.id === activeUnitId) ?? data.units[0];

  useEffect(() => {
    let frame = 0;
    const updateActiveUnit = () => {
      frame = 0;
      const sections = document.querySelectorAll<HTMLElement>(".unit-section[data-unit-id]");
      let nextId = data.units[0]?.id ?? 0;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 160) nextId = Number(section.dataset.unitId);
      });
      setActiveUnitId((current) => current === nextId ? current : nextId);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveUnit);
    };
    updateActiveUnit();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [data.units]);

  if (!activeUnit) return null;
  const activeColor = unitColors[(activeUnit.position - 1) % unitColors.length];

  return (
    <div className="learning-path" onClick={() => setSelectedLessonId(null)}>
      <header className={`section-banner unit-banner unit-${activeColor}`} aria-live="polite">
        <div>
          <small><ChevronLeft /> SECTION 1, UNIT {activeUnit.position}</small>
          <h1>{unitTitles[activeUnit.position - 1] ?? activeUnit.title}</h1>
        </div>
        <details key={activeUnit.id} className="guidebook">
          <summary><BookOpenText /> GUIDEBOOK</summary>
          <div><b>Unit guidebook</b><p>{activeUnit.description}</p></div>
        </details>
      </header>
      {data.units.map((unit) => {
        const allLessons = unit.skills.flatMap((skill) => skill.lessons.map((lesson) => ({ lesson, skill })));
        const unitLocked = unit.skills.every((skill) => skill.state === "LOCKED");
        return (
          <article key={unit.id} data-unit-id={unit.id} className={`unit-section unit-${unitColors[(unit.position - 1) % unitColors.length]}`}>
            {unit.position > 1 && <div className="unit-divider"><span>{unitTitles[unit.position - 1] ?? unit.title}</span></div>}
            <div className="path lesson-path">
              {allLessons.map(({ lesson, skill }, index) => <LessonNode key={lesson.id} lesson={lesson} skill={skill} index={index} unitLocked={unitLocked} unitPosition={unit.position} open={selectedLessonId === lesson.id} onToggle={() => setSelectedLessonId((current) => current === lesson.id ? null : lesson.id)} />)}
            </div>
          </article>
        );
      })}
      <section className="card section-up-next" aria-labelledby="up-next-title">
        <span className="up-next-label">UP NEXT</span>
        <h2 id="up-next-title"><LockKeyhole aria-hidden="true" /> Section 2</h2>
        <p>Learn words, phrases, and grammar<br />concepts for basic interactions</p>
        <button className="raised up-next-jump" onClick={() => window.alert("Section 2 is coming soon.")}>JUMP HERE?</button>
      </section>
      <BackToTop />
    </div>
  );
}

function LearnContent() {
  const { data, isLoading, error } = useQuery({ queryKey: ["path"], queryFn: () => api<CoursePath>("/courses/1/path") });
  if (isLoading) return <div className="path-loading"><Duo size={95} state="loading" /><p>Loading your path…</p></div>;
  if (error || !data) return <p>Could not load the course.</p>;
  return <CoursePathView data={data} />;
}

export default function LearnPage() {
  return <AppShell showTopStats={false} rightRail={<LearnRail />}><LearnContent /></AppShell>;
}
