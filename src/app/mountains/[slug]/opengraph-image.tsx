import { ImageResponse } from "next/og";

import { getMountainBySlug } from "@/lib/mountains";
import { SITE_NAME, formatBestMonthsWindow, formatMountainLocation } from "@/lib/seo";

export const alt = `${SITE_NAME} mountain hiking guide`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mountain = getMountainBySlug(slug);

  const title = mountain?.name ?? "Mountain hiking guide";
  const location = mountain ? formatMountainLocation(mountain) : "Philippines";
  const bestWindow = mountain ? formatBestMonthsWindow(mountain.best_months) : null;

  const facts = mountain
    ? [
        `${mountain.elevation_m.toLocaleString()} m`,
        `${mountain.difficulty} (${mountain.difficulty_score}/9)`,
        ...(bestWindow ? [`Best: ${bestWindow}`] : []),
      ]
    : [];

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
            "radial-gradient(circle at 80% 0%, rgba(56,189,248,0.22), transparent 45%), linear-gradient(135deg, #07314a 0%, #0f766e 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 340 220" fill="none">
            <path
              d="M12 204 112 68c13-18 40-18 53 0l35 48 32-43c13-18 39-18 52 0l104 131H12Z"
              fill="#ecfccb"
            />
            <path d="m157 90 18 24h-36l18-24Z" fill="#0f766e" />
          </svg>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>{SITE_NAME}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ fontSize: 28, color: "#cbd5e1" }}>{location}</span>
          <span style={{ fontSize: 84, fontWeight: 700, lineHeight: 1, maxWidth: 1000 }}>{title}</span>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {facts.map((fact) => (
            <span
              key={fact}
              style={{
                fontSize: 28,
                fontWeight: 600,
                padding: "12px 24px",
                borderRadius: 999,
                background: "rgba(248,250,252,0.14)",
                border: "1px solid rgba(248,250,252,0.25)",
              }}
            >
              {fact}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
