interface EmptyStateProps {
  title: string;
  description: string;
}


function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div
        aria-hidden="true"
        className="text-5xl"
      >
        📦
      </div>

      <h2 className="mt-4 text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
        {description}
      </p>
    </section>
  );
}


export default EmptyState;