import { createClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import { updateTrack, saveHandler, deleteHandler } from "../actions";
import { field, btn, btnDanger, card } from "@/lib/ui";

export default async function Tracks({ searchParams }: PageProps<"/admin/tracks">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: tracks }, { data: handlers }] = await Promise.all([
    supabase.from("tracks").select("*").order("id"),
    supabase.from("handlers").select("*").order("sort_order"),
  ]);
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Tracks</h1>
      <Notice ok={sp.ok} err={sp.err} />
      <div className="space-y-6">
        {(tracks ?? []).map((t) => (
          <div key={t.id} className={card}>
            <h2 className="text-xl font-semibold">{t.name} track</h2>
            <form action={updateTrack} className="mt-4 grid gap-4 sm:grid-cols-4 sm:items-end">
              <input type="hidden" name="id" value={t.id} />
              <label className="text-sm">Opening date<input type="date" name="opening_date" defaultValue={t.opening_date ?? ""} className={field} /></label>
              <label className="text-sm">Seats allocated<input type="number" min={0} name="seats_total" defaultValue={t.seats_total} className={field} /></label>
              <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="applications_open" defaultChecked={t.applications_open} className="size-4" />Applications open</label>
              <button className={btn}>Save</button>
            </form>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted">Workshop handlers</h3>
            <div className="mt-3 space-y-3">
              {(handlers ?? []).filter((h) => h.track_id === t.id).map((h) => (
                <div key={h.id} className="flex flex-wrap items-end gap-2">
                  <form action={saveHandler} className="flex flex-1 flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={h.id} /><input type="hidden" name="track_id" value={t.id} />
                    <input name="name" defaultValue={h.name} required className={field + " sm:w-44"} placeholder="Name" />
                    <input name="designation" defaultValue={h.designation ?? ""} className={field + " sm:flex-1"} placeholder="Designation" />
                    <input name="org" defaultValue={h.org ?? ""} className={field + " sm:w-52"} placeholder="Organisation" />
                    <input name="sort_order" type="number" defaultValue={h.sort_order} className={field + " w-16"} title="Order" />
                    <button className={btn}>Save</button>
                  </form>
                  <form action={deleteHandler}><input type="hidden" name="id" value={h.id} /><button className={btnDanger}>Remove</button></form>
                </div>
              ))}
              <form action={saveHandler} className="flex flex-wrap items-end gap-2 border-t border-black/5 pt-3">
                <input type="hidden" name="track_id" value={t.id} />
                <input name="name" required className={field + " sm:w-44"} placeholder="New handler name" />
                <input name="designation" className={field + " sm:flex-1"} placeholder="Designation" />
                <input name="org" className={field + " sm:w-52"} placeholder="Organisation" />
                <input name="sort_order" type="number" defaultValue={9} className={field + " w-16"} />
                <button className={btn}>Add</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
