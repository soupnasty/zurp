import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

export const alt = "zurp — see what your credit card is really worth";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const spaceMono = readFileSync(
    join(process.cwd(), "node_modules/@fontsource/space-mono/files/space-mono-latin-700-normal.woff")
  );

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
          fontFamily: "Space Mono",
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
              width: 180,
              height: 130,
              borderRadius: 22,
              border: "5px solid #22d3ee",
              backgroundColor: "#0a0e17",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: "22px 28px",
            }}
          >
            {/* Top bar */}
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 22,
                borderRadius: 11,
                overflow: "hidden",
              }}
            >
              <div style={{ flex: 6, backgroundColor: "#60a5fa", height: 22 }} />
              <div style={{ flex: 2, backgroundColor: "#a78bfa", height: 22 }} />
              <div style={{ flex: 1.5, backgroundColor: "#f87171", height: 22, borderRadius: "0 11px 11px 0" }} />
            </div>
            {/* Bottom bar */}
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 22,
                borderRadius: 11,
                overflow: "hidden",
                opacity: 0.5,
              }}
            >
              <div style={{ flex: 1.5, backgroundColor: "#f87171", height: 22, borderRadius: "11px 0 0 11px" }} />
              <div style={{ flex: 2, backgroundColor: "#a78bfa", height: 22 }} />
              <div style={{ flex: 6, backgroundColor: "#60a5fa", height: 22 }} />
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#f0f2f5",
            letterSpacing: "-2px",
          }}
        >
          zurp
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Mono",
          data: spaceMono,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
