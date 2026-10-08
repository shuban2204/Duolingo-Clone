"use client";

import { Duo } from "@/components/duo";
import { LessonLoader } from "@/components/lesson-loader";
import { api, RequestError } from "@/lib/api";
import { initialLessonState, lessonReducer, type Feedback } from "@/lib/lesson-state";
import type { Attempt, Exercise } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Heart, Sparkles, Volume2, X, XCircle as XCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useReducer, useState } from "react";

const answerPictures: Record<string, string> = {
  hello: "👋", goodbye: "🌅", man: "👨", woman: "👩", boy: "🧒", apple: "🍎",
  water: "💧", family: "👪", house: "🏠", train: "🚆", book: "📘", friend: "🤝",
  "to eat": "🍽️", "to drink": "🥤", "thank you": "💐", please: "🙏",
};

function speak(text: string, slow = false) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = slow ? 0.65 : 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function Multiple({ exercise, value, onChange }: ExerciseProps) {
  const options = exercise.payload.options as string[];
  return <div className="picture-option-grid">{options.map((option, index) => <button key={option} className={`raised picture-option ${value === option ? "selected" : ""}`} onClick={() => onChange(option)} aria-keyshortcuts={String(index + 1)}><span className="answer-picture" aria-hidden="true">{answerPictures[option.toLowerCase()] ?? "💬"}</span><span>{option}</span><kbd>{index + 1}</kbd></button>)}</div>;
}

type ExerciseProps = { exercise: Exercise; value: unknown; onChange: (value: unknown) => void };

function WordBank({ exercise, value, onChange }: ExerciseProps) {
  const words = exercise.payload.words as string[];
  const selected = Array.isArray(value) ? value as string[] : [];
  return <><div className="word-answer">{selected.map((word, index) => <button className="raised word" key={`${word}-${index}`} onClick={() => onChange(selected.filter((_, itemIndex) => itemIndex !== index))}>{word}</button>)}</div><div className="word-bank">{words.map((word, index) => { const used = selected.filter((item) => item === word).length > words.slice(0, index + 1).filter((item) => item === word).length - 1; return <button className="raised word" key={`${word}-${index}`} disabled={used} style={{ opacity: used ? 0.25 : 1 }} onClick={() => onChange([...selected, word])}>{word}</button>; })}</div></>;
}

function Fill({ exercise, value, onChange }: ExerciseProps) {
  return <div className="option-grid">{(exercise.payload.options as string[]).map((option, index) => <button className={`raised option ${value === option ? "selected" : ""}`} onClick={() => onChange(option)} key={option}><kbd>{index + 1}</kbd>{option}</button>)}</div>;
}

function TypeAnswer({ exercise, value, onChange }: ExerciseProps) {
  return <input autoFocus className="text-answer" placeholder={String(exercise.payload.placeholder || "Type your answer")} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") document.getElementById("lesson-action")?.click(); }} />;
}

function MatchPairs({ exercise, value, onChange }: ExerciseProps) {
  const left = exercise.payload.left as string[];
  const right = exercise.payload.right as string[];
  const pairs = Array.isArray(value) ? value as string[][] : [];
  const [chosen, setChosen] = useState<{ side: "left" | "right"; word: string } | null>(null);
  const done = (word: string) => pairs.some((pair) => pair.includes(word));
  const choose = (side: "left" | "right", word: string) => {
    if (!chosen || chosen.side === side) { setChosen({ side, word }); return; }
    onChange([...pairs, side === "right" ? [chosen.word, word] : [word, chosen.word]]);
    setChosen(null);
  };
  return <div className="match-grid"><div>{left.map((word) => <button key={word} className={`raised option match ${chosen?.word === word ? "selected" : ""} ${done(word) ? "done" : ""}`} onClick={() => choose("left", word)}>{word}</button>)}</div><div>{right.map((word) => <button key={word} className={`raised option match ${chosen?.word === word ? "selected" : ""} ${done(word) ? "done" : ""}`} onClick={() => choose("right", word)}>{word}</button>)}</div></div>;
}

function ExerciseView(props: ExerciseProps) {
  if (props.exercise.type === "WORD_BANK") return <WordBank {...props} />;
  if (props.exercise.type === "MATCH_PAIRS") return <MatchPairs {...props} />;
  if (props.exercise.type === "FILL_BLANK") return <Fill {...props} />;
  if (props.exercise.type === "TYPE_ANSWER") return <TypeAnswer {...props} />;
  return <Multiple {...props} />;
}

function LessonCharacter({ exercise }: { exercise: Exercise }) {
  if (exercise.type === "MULTIPLE_CHOICE" || exercise.type === "FILL_BLANK") return <Duo size={112} state="reading" />;
  const character = exercise.type === "WORD_BANK" ? "👩🏾" : exercise.type === "TYPE_ANSWER" ? "👨🏻" : "🧑🏽";
  return <span className={`lesson-friend friend-${exercise.type.toLowerCase()}`} role="img" aria-label="Lesson character">{character}</span>;
}

function CharacterPrompt({ exercise }: { exercise: Exercise }) {
  return <div className="character-prompt"><LessonCharacter exercise={exercise} /><div className="speech-bubble lesson-speech"><span>{exercise.prompt}</span>{exercise.audio_text && <span className="speech-actions"><button onClick={() => speak(exercise.audio_text!)} aria-label="Play audio"><Volume2 /></button><button onClick={() => speak(exercise.audio_text!, true)} aria-label="Play audio slowly">SLOW</button></span>}</div></div>;
}

function Encouragement({ onContinue }: { onContinue: () => void }) {
  return <main className="encouragement-screen"><div className="encouragement-scene"><Duo size={190} state="encourage" /><div className="speech-bubble">Awesome! You’re working hard and learning new words!</div></div><footer><button className="raised primary action" onClick={onContinue}>CONTINUE</button></footer></main>;
}

function LessonPlayer() {
  const params = useParams<{ lessonId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const lessonId = Number(params.lessonId);
  const mode = search.get("mode") ?? "STANDARD";
  const [state, dispatch] = useReducer(lessonReducer, initialLessonState);
  const [seconds, setSeconds] = useState<number | null>(null);
  const [exit, setExit] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const [encouragement, setEncouragement] = useState(false);
  const [encouragementShown, setEncouragementShown] = useState(false);

  const attemptQuery = useQuery({ queryKey: ["attempt", lessonId, mode], queryFn: () => api<Attempt>("/attempts", { method: "POST", body: JSON.stringify({ lesson_id: lessonId, mode }) }), retry: false });
  const attempt = attemptQuery.data;
  const exercise = attempt?.exercises.find((item) => item.position === attempt.current_position);

  useEffect(() => { const timer = window.setTimeout(() => setLoaderDone(true), 1100); return () => window.clearTimeout(timer); }, []);
  useEffect(() => {
    if (!attempt?.expires_at) return;
    const tick = () => setSeconds(Math.max(0, Math.ceil((new Date(attempt.expires_at!).getTime() - Date.now()) / 1000)));
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer);
  }, [attempt?.expires_at]);
  useEffect(() => {
    const options = exercise?.payload.options;
    if (!Array.isArray(options)) return;
    const onKey = (event: KeyboardEvent) => { const index = Number(event.key) - 1; if (state.phase === "answering" && index >= 0 && index < options.length) dispatch({ type: "SELECT", answer: options[index] }); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [exercise, state.phase]);

  const answer = useMutation<Feedback, RequestError, unknown>({
    mutationFn: (submitted) => api<Feedback>(`/attempts/${attempt!.id}/answers`, { method: "POST", body: JSON.stringify({ exercise_id: exercise!.id, answer: submitted }) }),
    onMutate: () => dispatch({ type: "CHECK" }),
    onSuccess: (feedback) => {
      dispatch({ type: "FEEDBACK", feedback });
      queryClient.setQueryData<Attempt>(["attempt", lessonId, mode], (old) => old ? { ...old, mistakes: old.mistakes + (feedback.correct ? 0 : 1), xp_earned: old.xp_earned + feedback.xp_awarded, hearts: feedback.hearts, status: feedback.attempt_status } : old);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => dispatch({ type: "NEXT" }),
  });
  const complete = useMutation({ mutationFn: () => api<{ xp_earned: number; new_achievements: string[] }>(`/attempts/${attempt!.id}/complete`, { method: "POST" }), onSuccess: (result) => { dispatch({ type: "COMPLETE", result }); queryClient.invalidateQueries({ queryKey: ["user"] }); queryClient.invalidateQueries({ queryKey: ["path"] }); } });
  const hasAnswer = useMemo(() => Array.isArray(state.answer) ? state.answer.length > 0 : typeof state.answer === "string" ? state.answer.trim().length > 0 : state.answer != null, [state.answer]);

  const advanceCorrect = () => {
    if ((state.feedback?.next_position ?? 0) >= (attempt?.exercises.length ?? 0) + 1) { complete.mutate(); return; }
    queryClient.setQueryData<Attempt>(["attempt", lessonId, mode], (old) => old ? { ...old, current_position: state.feedback!.next_position } : old);
    dispatch({ type: "NEXT" });
  };
  const next = () => {
    if (state.phase === "wrong") { dispatch({ type: "NEXT" }); return; }
    if (state.phase === "correct") {
      if (state.feedback?.next_position === 3 && !encouragementShown) { advanceCorrect(); setEncouragementShown(true); setEncouragement(true); return; }
      advanceCorrect(); return;
    }
    if (state.phase === "answering" && hasAnswer) answer.mutate(state.answer);
  };

  if (attemptQuery.isLoading || !loaderDone) return <LessonLoader />;
  if (attemptQuery.error) { const error = attemptQuery.error as RequestError; return <div className="completion lesson-completion"><div><Duo size={110} state="encourage" /><h1 style={{ color: "var(--red)" }}>{error.body?.message ?? "Lesson unavailable"}</h1><button className="raised primary action" onClick={() => router.push(error.body?.code === "no_hearts" ? "/shop" : "/learn")}>CONTINUE</button></div></div>; }
  if (encouragement) return <Encouragement onContinue={() => setEncouragement(false)} />;
  if (state.phase === "complete") return <div className="completion lesson-completion"><motion.div className="completion-card" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Duo size={150} state="celebrate" /><h1>Lesson complete!</h1><p className="muted">You made Duo proud.</p><div className="result-grid"><div className="result" style={{ color: "var(--orange)" }}>⚡ {state.result?.xp_earned}<small>TOTAL XP</small></div><div className="result" style={{ color: "var(--red)" }}>❤️ {state.feedback?.hearts ?? attempt?.hearts ?? 5}<small>HEARTS LEFT</small></div></div>{state.result?.new_achievements?.length ? <p>🏅 New achievement unlocked!</p> : null}<button className="raised primary action" onClick={() => router.push("/learn")}>CONTINUE</button></motion.div></div>;
  if (state.phase === "failed") return <div className="completion lesson-completion"><div className="completion-card"><Duo size={120} state="encourage" /><h1 style={{ color: "var(--red)" }}>You&apos;re out of hearts!</h1><p className="muted">Practice to keep learning, or refill your hearts in the shop.</p><button className="raised primary action" onClick={() => router.push("/practice")}>PRACTICE</button> <button className="raised action" onClick={() => router.push("/shop")}>GO TO SHOP</button></div></div>;
  if (!attempt || !exercise) return null;
  const percentage = (exercise.position - 1) / attempt.exercises.length * 100;

  return <main className="lesson-page"><header className="lesson-header"><button aria-label="Exit lesson" className="lesson-exit" onClick={() => setExit(true)}><X size={30} /></button><div className="lesson-progress"><div style={{ width: `${percentage}%` }} /></div>{seconds !== null && <b className={seconds < 10 ? "timer-low" : "timer"}>⏱️ {seconds}</b>}<b className="lesson-hearts"><Heart fill="currentColor" /> {state.feedback?.hearts ?? attempt.hearts}</b></header><section className="lesson-body">{(exercise.position === 1 || exercise.position === 4) && <div className="new-word"><Sparkles /> NEW WORD</div>}<h1>{exercise.instruction}</h1><CharacterPrompt exercise={exercise} /><AnimatePresence mode="wait"><motion.div key={exercise.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><ExerciseView exercise={exercise} value={state.answer} onChange={(value) => dispatch({ type: "SELECT", answer: value })} /></motion.div></AnimatePresence></section><footer className={`lesson-footer ${state.phase}`}><div className="footer-inner"><button className="raised lesson-skip" disabled={state.phase !== "answering" || answer.isPending} onClick={() => answer.mutate("__SKIPPED__")}>SKIP</button><div className="feedback">{state.phase === "correct" && <><h2><CheckCircle2 /> Nicely done!</h2><p>{state.feedback?.explanation}</p></>}{state.phase === "wrong" && <><h2><XCircle2 /> Correct answer:</h2><p>{state.feedback?.canonical_answer} · {state.feedback?.explanation}</p></>}</div><button id="lesson-action" className={`raised action ${state.phase === "wrong" ? "danger" : "primary"}`} disabled={state.phase === "checking" || (!hasAnswer && state.phase === "answering")} onClick={next}>{state.phase === "checking" ? "CHECKING…" : state.phase === "answering" ? "CHECK" : "CONTINUE"}</button></div></footer>{exit && <div className="modal-backdrop"><div className="card modal"><Duo size={90} state="encourage" /><h2>Wait, don&apos;t go!</h2><p className="muted">Your lesson progress is saved, but this session will end.</p><button className="raised primary action" onClick={() => setExit(false)}>KEEP LEARNING</button><button className="end-session" onClick={() => router.push("/learn")}>END SESSION</button></div></div>}</main>;
}

export default function LessonPage() {
  return <Suspense fallback={<LessonLoader />}><LessonPlayer /></Suspense>;
}
