import { tracks as staticTracks, type Track, type Handler } from "@/lib/content";
import { createPublicClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type LiveTrack = Track & { seatsLeft: number };

// Merges the fixed curriculum content with the admin-controlled values from the database.
export async function loadTracks(): Promise<LiveTrack[]> {
  const fallback = staticTracks.map((t) => ({ ...t, seatsLeft: Math.max(t.seatsTotal - t.seatsFilled, 0) }));
  if (!supabaseConfigured) return fallback;
  try {
    const supabase = createPublicClient();
    const [intake, handlers] = await Promise.all([
      supabase.rpc("track_intake"),
      supabase.from("handlers").select("track_id, name, designation, org, photo_url, sort_order").order("sort_order"),
    ]);
    if (intake.error || !intake.data) return fallback;
    return staticTracks.map((t) => {
      const row = (intake.data as { track_id: string; seats_total: number; seats_left: number; applications_open: boolean; opening_date: string | null }[]).find((r) => r.track_id === t.id);
      const hs: Handler[] = ((handlers.data ?? []) as { track_id: string; name: string; designation: string | null; org: string | null; photo_url: string | null }[])
        .filter((h) => h.track_id === t.id)
        .map((h) => ({ name: h.name, designation: h.designation ?? "", org: h.org ?? "", photo: h.photo_url ?? "" }));
      return {
        ...t,
        openingDate: row?.opening_date ?? t.openingDate,
        seatsTotal: row?.seats_total ?? t.seatsTotal,
        seatsFilled: row ? row.seats_total - row.seats_left : t.seatsFilled,
        seatsLeft: Math.max(row?.seats_left ?? t.seatsTotal, 0),
        applicationsOpen: row?.applications_open ?? t.applicationsOpen,
        handlers: hs.length ? hs : t.handlers,
      };
    });
  } catch {
    return fallback;
  }
}
