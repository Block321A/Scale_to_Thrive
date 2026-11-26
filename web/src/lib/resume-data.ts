import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/auth";
import type { ResumeInput } from "@/lib/resume";

// Loads what the resume needs: the student's workshop application details and their progress.
export async function loadResumeInput(supabase: SupabaseClient, me: Profile): Promise<ResumeInput | null> {
  const [{ data: e }, { data: ms }] = await Promise.all([
    supabase.from("enrollees").select("track_id, college, city_state, career_goal, github_url, details").eq("id", me.id).single(),
    supabase.from("enrollee_milestones").select("week, status").eq("enrollee_id", me.id),
  ]);
  if (!e) return null;
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
    completedWeeks: ((ms ?? []) as { week: number; status: string }[]).filter((m) => m.status === "completed").map((m) => m.week),
  };
}
