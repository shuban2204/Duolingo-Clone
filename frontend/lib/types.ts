export type User = {
  id: number; name: string; avatar: string; total_xp: number; hearts: number; max_hearts: number;
  seconds_to_next_heart: number; gems: number; current_streak: number; longest_streak: number;
  streak_freezes: number; daily_goal: number; daily_xp: number; league: string; theme: "light" | "dark";
  sound_enabled: boolean; course_score: number; quests_completed: number;
  completed_lessons?: number; leaderboard_unlocked?: boolean; lessons_to_unlock_leaderboard?: number;
};
export type ExerciseType = "MULTIPLE_CHOICE" | "WORD_BANK" | "MATCH_PAIRS" | "FILL_BLANK" | "TYPE_ANSWER";
export type Exercise = { id: number; type: ExerciseType; instruction: string; prompt: string; payload: Record<string, unknown>; audio_text: string | null; position: number };
export type Attempt = { id: number; lesson_id: number; mode: string; status: string; current_position: number; mistakes: number; xp_earned: number; hearts: number; started_at: string; expires_at: string | null; exercises: Exercise[] };
export type Skill = { id: number; title: string; description: string; icon: string; state: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED"; crowns: number; total_crowns: number; legendary: boolean; lessons: { id: number; title: string; position: number; completed: boolean }[] };
export type CoursePath = { course: { id: number; title: string; language: string; flag: string }; user: User; units: { id: number; title: string; description: string; position: number; reward_gems: number; skills: Skill[] }[] };
export type ApiError = { code: string; message: string; details: Record<string, unknown> };
