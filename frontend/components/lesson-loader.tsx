"use client";

import { Duo } from "@/components/duo";
import { useEffect, useState } from "react";

const facts = [
  "We teach endangered languages, including Navajo and Hawaiian.",
  "Short daily lessons help build a lasting learning habit.",
  "Mistakes are an important part of learning.",
];

export function LessonLoader({ message = "Preparing your lesson…" }: { message?: string }) {
  const [fact, setFact] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setFact((value) => (value + 1) % facts.length), 1800); return () => window.clearInterval(timer); }, []);
  return <main className="lesson-loading"><Duo size={145} state="loading" /><strong>LOADING…</strong><h2>{message}</h2><p>{facts[fact]}</p></main>;
}
