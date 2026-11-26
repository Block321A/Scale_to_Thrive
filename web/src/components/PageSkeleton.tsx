// Shown instantly while a signed-in page loads its data.
export default function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 py-12" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-1/3 rounded-full bg-black/10" />
      <div className="mt-4 h-4 w-1/2 rounded-full bg-black/5" />
      <div className="mt-10 space-y-4">
        {[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-[28px] bg-black/5" />)}
      </div>
    </div>
  );
}
