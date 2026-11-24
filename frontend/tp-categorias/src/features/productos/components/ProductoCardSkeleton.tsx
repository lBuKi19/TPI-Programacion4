function ProductoCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />

      <div className="space-y-4 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />

        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />

        <div className="space-y-2">
          <div className="h-3 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />

        <div className="h-12 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}


export default ProductoCardSkeleton;