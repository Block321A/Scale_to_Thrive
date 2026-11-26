import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/auth";
import type { ResumeInput } from "@/lib/resume";

type EnrolleeRow = { track_id: string; college: string; city_state: string | null; career_goal: string | null; github_url: string | null; details: unknown };

// Builds the resume input from rows that are already loaded (no extra database calls).
export function resumeInputFrom(me: Profile, e: EnrolleeRow, ms: { week: number; status: string }[]): ResumeInput {
  return {
    name: me.full_name ?? me.email,
    email: me.email,
    phone: me.phone,
    city: e.city_state,
    college: e.college,
    track: e.track_id === "non-it" ? "non-it" : "it",
    goal: e.career_goal,
    github: e.github_url,
    details: (e.details ?? {}) as Record<string, string | null>,
    completedWeeks: ms.filter((m) => m.status === "completed").map((m) => m.week),
  };
}

// Loads what the resume needs: the student's workshop application details and their progress (both queries run together).
export async function loadResumeInput(supabase: SupabaseClient, me: Profile): Promise<ResumeInput | null> {
  const [{ data: e }, { data: ms }] = await Promise.all([
    supabase.from("enrollees").select("track_id, college, city_state, career_goal, github_url, details").eq("id", me.id).single(),
    supabase.from("enrollee_milestones").select("week, status").eq("enrollee_id", me.id),
  ]);
  return e ? resumeInputFrom(me, e as EnrolleeRow, (ms ?? []) as { week: number; status: string }[]) : null;
}
