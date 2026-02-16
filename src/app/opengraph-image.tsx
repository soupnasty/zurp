import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "zurp — see what your credit card is really worth";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0e17",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 40,
          }}
        >
          {/* Card icon */}
          <div
            style={{
              width: 120,
              height: 86,
              borderRadius: 16,
              border: "4px solid #22d3ee",
              backgroundColor: "#0a0e17",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "16px 20px",
            }}
          >
            {/* Top bar */}
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 16,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div style={{ flex: 6, backgroundColor: "#60a5fa", height: 16 }} />
              <div style={{ flex: 2, backgroundColor: "#a78bfa", height: 16 }} />
              <div style={{ flex: 1.5, backgroundColor: "#f87171", height: 16, borderRadius: "0 8px 8px 0" }} />
            </div>
            {/* Bottom bar */}
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 16,
                borderRadius: 8,
                overflow: "hidden",
                opacity: 0.5,
              }}
            >
              <div style={{ flex: 1.5, backgroundColor: "#f87171", height: 16, borderRadius: "8px 0 0 8px" }} />
              <div style={{ flex: 2, backgroundColor: "#a78bfa", height: 16 }} />
              <div style={{ flex: 6, backgroundColor: "#60a5fa", height: 16 }} />
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#f0f2f5",
            letterSpacing: "-2px",
            marginBottom: 16,
          }}
        >
          zurp
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: "#7a8ba8",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          See what your credit card is really worth
        </div>
      </div>
    ),
    { ...size }
  );
}
