export type Feedback = {
  correct: boolean;
  canonical_answer: string | null;
  explanation: string;
  hearts: number;
  xp_awarded: number;
  attempt_status: string;
  next_position: number;
};

export type LessonState = {
  phase: "answering" | "checking" | "correct" | "wrong" | "complete" | "failed";
  answer: unknown;
  feedback: Feedback | null;
  result: { xp_earned: number; new_achievements: string[] } | null;
};

export type LessonAction =
  | { type: "SELECT"; answer: unknown }
  | { type: "CHECK" }
  | { type: "FEEDBACK"; feedback: Feedback }
  | { type: "NEXT" }
  | { type: "COMPLETE"; result: LessonState["result"] }
  | { type: "FAILED" };

export const initialLessonState: LessonState = { phase: "answering", answer: null, feedback: null, result: null };

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case "SELECT": return { ...state, answer: action.answer };
    case "CHECK": return { ...state, phase: "checking" };
    case "FEEDBACK": return { ...state, phase: action.feedback.correct ? "correct" : action.feedback.attempt_status === "FAILED" ? "failed" : "wrong", feedback: action.feedback };
    case "NEXT": return { ...state, phase: "answering", answer: null, feedback: null };
    case "COMPLETE": return { ...state, phase: "complete", result: action.result };
    case "FAILED": return { ...state, phase: "failed" };
  }
}
