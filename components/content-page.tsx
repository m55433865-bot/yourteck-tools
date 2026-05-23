type ContentPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function ContentPage({
  eyebrow,
  title,
  description,
  children,
}: ContentPageProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-sm font-semibold uppercase text-cyan-700">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>
        <div className="mt-10 grid gap-8 text-base leading-8 text-slate-600">
          {children}
        </div>
      </div>
    </section>
  );
}
