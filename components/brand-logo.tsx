import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  inverted?: boolean;
};

export function BrandLogo({ href = "/", inverted = false }: BrandLogoProps) {
  const content = (
    <span className="flex items-center gap-3">
      <span
        className={`flex size-10 items-center justify-center rounded-lg border text-sm font-bold tracking-tight ${
          inverted
            ? "border-white/15 bg-white text-slate-950"
            : "border-slate-200 bg-slate-950 text-white"
        }`}
        aria-hidden="true"
      >
        YT
      </span>
      <span className="grid leading-none">
        <span
          className={`text-base font-semibold tracking-tight ${
            inverted ? "text-white" : "text-slate-950"
          }`}
        >
          YourTeck
        </span>
        <span
          className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
            inverted ? "text-cyan-200" : "text-cyan-700"
          }`}
        >
          Tools
        </span>
      </span>
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} aria-label="YourTeck Tools home">
      {content}
    </Link>
  );
}
