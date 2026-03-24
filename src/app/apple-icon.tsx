import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0f766e 0%, #14532d 100%)",
          borderRadius: 44,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 34,
            right: 28,
            width: 30,
            height: 30,
            borderRadius: 999,
            background: "#fde68a",
          }}
        />
        <svg width="120" height="86" viewBox="0 0 120 86" fill="none">
          <path
            d="M6 80 40 34c5-6 14-6 19 0l12 16 12-15c5-6 14-6 19 0l34 45H6Z"
            fill="url(#peak)"
          />
          <path d="M24 80h72" stroke="#dcfce7" strokeWidth="7" strokeLinecap="round" />
          <defs>
            <linearGradient id="peak" x1="32" y1="24" x2="92" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#dcfce7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    size,
  );
}
