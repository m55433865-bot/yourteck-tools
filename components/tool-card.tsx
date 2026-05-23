import Link from "next/link";
import type { Tool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const isAvailable = tool.status !== "coming-soon";

  return (
    <Link
      href={tool.href}
      className="group flex min-h-48 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
      aria-disabled={!isAvailable}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-md bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
          {tool.category}
        </span>
        {!isAvailable ? (
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Soon
          </span>
        ) : null}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950 group-hover:text-cyan-800">
        {tool.name}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
        {tool.description}
      </p>
      <span className="mt-5 text-sm font-semibold text-slate-950">
        {isAvailable ? "Open tool" : "View category"}
      </span>
    </Link>
  );
}
