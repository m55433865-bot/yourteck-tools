import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/tools";

export const alt = "YourTeck Tools";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f8fafc",
          color: "#020617",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div
            style={{
              width: "112px",
              height: "112px",
              borderRadius: "24px",
              background: "#020617",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: 800,
            }}
          >
            YT
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "54px", fontWeight: 800 }}>
              YourTeck
            </div>
            <div
              style={{
                marginTop: "8px",
                color: "#0e7490",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "8px",
              }}
            >
              TOOLS
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "68px", fontWeight: 800, lineHeight: 1.05 }}>
            Free online tools for everyday file tasks
          </div>
          <div
            style={{
              marginTop: "28px",
              maxWidth: "850px",
              color: "#475569",
              fontSize: "30px",
              lineHeight: 1.35,
            }}
          >
            {siteConfig.description}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
