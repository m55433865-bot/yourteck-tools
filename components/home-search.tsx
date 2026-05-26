"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { tools } from "@/lib/tools";

export function HomeSearch() {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return tools.filter((tool) => tool.featured);
    }

    return tools.filter((tool) =>
      `${tool.name} ${tool.description} ${tool.category}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <div className="mx-auto mt-8 w-full max-w-2xl">
      <label htmlFor="home-search" className="sr-only">
        Search YourTeck Tools
      </label>
      <input
        id="home-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search for file converters and tools"
        className="h-14 w-full rounded-lg border border-slate-300 bg-white px-5 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
      />
      <div className="mt-3 grid max-h-96 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        {matches.map((tool) => (
          <Link
            key={tool.slug}
            href={tool.href}
            className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
          >
            {tool.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
