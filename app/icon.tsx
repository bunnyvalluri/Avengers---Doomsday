import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
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
          background: "linear-gradient(135deg, #062b1d, #020b08)",
          borderRadius: "7px",
          border: "1.5px solid #00ff9c",
          boxShadow: "0 0 10px rgba(0, 255, 156, 0.8)",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 22H7L9.5 16.5H16L12 7.5L13.8 3.5L12 2Z"
            fill="#00ff9c"
          />
          <path
            d="M12 2L22 22H17L14.5 16.5H8L12 7.5L10.2 3.5L12 2Z"
            fill="#ffffff"
          />
          <path
            d="M6.5 16H21.5L19 12.5H8L6.5 16Z"
            fill="#00ff9c"
          />
          <circle cx="12" cy="14" r="2" fill="#ffffff" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
