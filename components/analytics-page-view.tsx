"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type GtagWindow = Window & {
  gtag?: (
    command: "config",
    targetId: string,
    config?: Record<string, string | boolean>,
  ) => void;
};

export function AnalyticsPageView({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.toString();
    const pagePath = search ? `${pathname}?${search}` : pathname;
    const browserWindow = window as GtagWindow;

    browserWindow.gtag?.("config", gaId, {
      page_path: pagePath,
      send_page_view: true,
    });
  }, [gaId, pathname, searchParams]);

  return null;
}
