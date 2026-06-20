import Link from 'next/link';

export function EmptyState({ title, description, actionHref, actionLabel }: { title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return (
    <section className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
      <h2 className="text-2xl font-black text-emerald-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="mt-6 inline-flex rounded-lg bg-emerald-900 px-5 py-3 text-sm font-black text-white">
          {actionLabel}
        </Link>
      )}
    </section>
  );
}
