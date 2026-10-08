import { describe, expect, it } from "vitest";
import { initialLessonState, lessonReducer } from "./lesson-state";

describe("lesson reducer", () => {
  it("moves through checking, correct feedback, and next", () => {
    const selected = lessonReducer(initialLessonState, { type: "SELECT", answer: "hola" });
    expect(lessonReducer(selected, { type: "CHECK" }).phase).toBe("checking");
    const correct = lessonReducer(selected, { type: "FEEDBACK", feedback: { correct: true, canonical_answer: null, explanation: "Good", hearts: 5, xp_awarded: 10, attempt_status: "ACTIVE", next_position: 2 } });
    expect(correct.phase).toBe("correct");
    expect(lessonReducer(correct, { type: "NEXT" })).toEqual(initialLessonState);
  });

  it("enters failed state when the server marks an incorrect attempt failed", () => {
    const failed = lessonReducer(initialLessonState, { type: "FEEDBACK", feedback: { correct: false, canonical_answer: "hola", explanation: "Try again", hearts: 0, xp_awarded: 0, attempt_status: "FAILED", next_position: 1 } });
    expect(failed.phase).toBe("failed");
  });
});
