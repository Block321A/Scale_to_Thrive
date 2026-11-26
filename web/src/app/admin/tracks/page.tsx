import { createClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import { updateTrack, saveHandler, deleteHandler } from "../actions";
import Avatar from "@/components/Avatar";
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
                <div key={h.id} className="rounded-2xl border border-black/5 p-4">
                  <form action={saveHandler} className="grid gap-3 sm:grid-cols-[auto_1fr_1fr_1fr_5rem]">
                    <input type="hidden" name="id" value={h.id} /><input type="hidden" name="track_id" value={t.id} />
                    <Avatar src={h.photo_url} name={h.name} size={56} />
                    <input name="name" defaultValue={h.name} required className={field} placeholder="Name" />
                    <input name="designation" defaultValue={h.designation ?? ""} className={field} placeholder="Designation" />
                    <input name="org" defaultValue={h.org ?? ""} className={field} placeholder="Organisation" />
                    <label className="text-xs text-muted">Order<input name="sort_order" type="number" defaultValue={h.sort_order} className={field + " mt-1"} /></label>
                    <div className="flex flex-wrap items-center gap-3 sm:col-span-5">
                      <label className="text-sm font-medium">{h.photo_url ? "Change photo" : "Upload photo"}
                        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90" />
                      </label>
                      {h.photo_url && <label className="flex items-center gap-1 text-xs text-muted"><input type="checkbox" name="remove_photo" className="size-3.5" />Remove photo</label>}
                      <button className={btn + " ml-auto"}>Save</button>
                    </div>
                  </form>
                  <form action={deleteHandler} className="mt-2 text-right"><input type="hidden" name="id" value={h.id} /><button className={btnDanger}>Remove handler</button></form>
                </div>
              ))}
              <form action={saveHandler} className="grid gap-3 rounded-2xl border border-dashed border-black/10 p-4 sm:grid-cols-[1fr_1fr_1fr_5rem]">
                <input type="hidden" name="track_id" value={t.id} />
                <input name="name" required className={field} placeholder="New handler name" />
                <input name="designation" className={field} placeholder="Designation" />
                <input name="org" className={field} placeholder="Organisation" />
                <label className="text-xs text-muted">Order<input name="sort_order" type="number" defaultValue={9} className={field + " mt-1"} /></label>
                <div className="flex flex-wrap items-center gap-3 sm:col-span-4">
                  <label className="text-sm font-medium">Upload photo (optional)
                    <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90" />
                  </label>
                  <button className={btn + " ml-auto"}>Add handler</button>
                </div>
              </form>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
