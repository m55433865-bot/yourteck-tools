"use client";

import { useMemo, useState } from "react";
import { categories, tools } from "@/lib/tools";
import { ToolCard } from "./tool-card";

export function ToolsBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesCategory = category === "All" || tool.category === category;
      const matchesQuery =
        !normalizedQuery ||
        `${tool.name} ${tool.description} ${tool.category}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label htmlFor="tool-search" className="text-sm font-semibold text-slate-950">
          Search tools
        </label>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            id="tool-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search converter, audio, PDF..."
            className="h-12 rounded-md border border-slate-300 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
          />
          <div className="flex flex-wrap gap-2">
            {["All", ...categories].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`h-12 rounded-md px-4 text-sm font-semibold transition ${
                  category === item
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
