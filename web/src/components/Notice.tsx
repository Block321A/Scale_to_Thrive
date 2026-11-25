export default function Notice({ ok, err }: { ok?: string | string[]; err?: string | string[] }) {
  if (err) return <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>;
  if (ok) return <p className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{ok}</p>;
  return null;
}
