import { ImageResponse } from "next/og";

export const alt = "Spectraverse: private, local AI on your Mac";
export const size = { width: 1200, height: 630 };
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
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b0b10 0%, #1c1a2e 100%)",
          color: "#f5f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, color: "#f59e0b", fontWeight: 700 }}>
          Spectraverse
        </div>
        <div
          style={{ fontSize: 76, fontWeight: 700, marginTop: 24, lineHeight: 1.1 }}
        >
          Run all your AI models locally, in one place
        </div>
        <div style={{ fontSize: 32, marginTop: 32, color: "#a1a1aa" }}>
          Private AI assistant and coding agent on your own Mac
        </div>
      </div>
    ),
    size,
  );
}
