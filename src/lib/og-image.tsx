import { ImageResponse } from "next/og";

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/png";

export function ogImage({
  kicker,
  title,
  detail,
  footer,
}: {
  kicker: string;
  title: string;
  detail: string;
  footer?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3e6c8",
          color: "#3a2d1f",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 1040,
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#8a5428",
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              fontSize: title.length > 48 ? 52 : 64,
              lineHeight: 1.08,
              fontWeight: 600,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: "#5c4a38",
            }}
          >
            {detail}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#6b5340",
          }}
        >
          <span>i sell stuffs</span>
          <span>{footer ?? "the mall"}</span>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
