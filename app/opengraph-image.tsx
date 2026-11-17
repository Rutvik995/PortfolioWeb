import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rutvik Bhanderi — AI Systems Engineer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#F3EFE7",
          color: "#16140F",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          border: "12px solid #D9D3C5",
          fontFamily: "serif",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #D9D3C5",
            paddingBottom: "24px",
            fontSize: "18px",
            fontFamily: "monospace",
            color: "#5C574D",
          }}
        >
          <span>00 / TECHNICAL SPECIFICATION</span>
          <span>RAJKOT, INDIA</span>
        </div>

        {/* Center Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "20px",
              fontFamily: "monospace",
              color: "#D4491F",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            AI Systems Engineer &middot; LangGraph &middot; Multi-Agent
          </div>

          <div
            style={{
              fontSize: "68px",
              lineHeight: 1.1,
              fontWeight: 400,
              color: "#16140F",
            }}
          >
            I build AI agents that <span style={{ fontStyle: "italic", color: "#D4491F" }}>actually finish the job.</span>
          </div>

          <div
            style={{
              fontSize: "24px",
              color: "#5C574D",
              maxWidth: "850px",
              marginTop: "8px",
              lineHeight: 1.5,
            }}
          >
            Architecting deterministic multi-agent state machines, 4-tier memory digestion, and production data systems.
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #D9D3C5",
            paddingTop: "24px",
            fontSize: "18px",
            fontFamily: "monospace",
            color: "#16140F",
          }}
        >
          <span style={{ fontWeight: 600 }}>Rutvik Bhanderi</span>
          <span style={{ color: "#5C574D" }}>github.com/Rutvik995 &middot; rutvik.professional@gmail.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
