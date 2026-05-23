type AdPlaceholderProps = {
  slot: string;
  variant?: "banner" | "sidebar";
  className?: string;
};

export function AdPlaceholder({
  slot,
  variant = "banner",
  className = "",
}: AdPlaceholderProps) {
  const sizeClass =
    variant === "sidebar"
      ? "min-h-[280px] lg:min-h-[600px]"
      : "min-h-[96px] sm:min-h-[120px]";

  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={slot}
      className={`flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 ${sizeClass} ${className}`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.18em]">
        Advertisement
      </span>
    </aside>
  );
}
