import { ImageResponse } from "next/og";

import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.25), transparent 45%), linear-gradient(135deg, #07314a 0%, #0f766e 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="96" height="96" viewBox="0 0 340 220" fill="none">
            <path
              d="M12 204 112 68c13-18 40-18 53 0l35 48 32-43c13-18 39-18 52 0l104 131H12Z"
              fill="#ecfccb"
            />
            <path d="m157 90 18 24h-36l18-24Z" fill="#0f766e" />
          </svg>
          <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>{SITE_NAME}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
            Plan safer hikes with weather by date.
          </span>
          <span style={{ fontSize: 32, color: "#cbd5e1", maxWidth: 880 }}>{SITE_TAGLINE}</span>
        </div>
      </div>
    ),
    size,
  );
}
