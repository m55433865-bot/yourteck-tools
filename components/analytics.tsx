import Script from "next/script";
import { Suspense } from "react";
import { AnalyticsPageView } from "@/components/analytics-page-view";

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId || !isValidGoogleAnalyticsId(gaId)) {
    return null;
  }

  return (
    <>
      <Script
        id="google-analytics-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname + window.location.search,
            send_page_view: false
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsPageView gaId={gaId} />
      </Suspense>
    </>
  );
}

function isValidGoogleAnalyticsId(gaId: string) {
  return /^G-[A-Z0-9]+$/i.test(gaId);
}
