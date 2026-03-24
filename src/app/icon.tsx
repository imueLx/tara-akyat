import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 120,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 102,
            right: 86,
            width: 88,
            height: 88,
            borderRadius: 999,
            background: "#fde68a",
          }}
        />
        <svg width="340" height="220" viewBox="0 0 340 220" fill="none">
          <path
            d="M12 204 112 68c13-18 40-18 53 0l35 48 32-43c13-18 39-18 52 0l104 131H12Z"
            fill="url(#peak)"
          />
          <path d="m157 90 18 24h-36l18-24Z" fill="#ecfccb" />
          <path d="M48 204h244" stroke="#dcfce7" strokeWidth="18" strokeLinecap="round" />
          <defs>
            <linearGradient id="peak" x1="96" y1="52" x2="270" y2="218" gradientUnits="userSpaceOnUse">
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
