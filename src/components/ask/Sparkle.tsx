import { useId } from "react";

// Four-point star in the Gemini manner. Spins slowly; faster while the answer is being written.
export function Sparkle({ busy = false }: { busy?: boolean }) {
  const id = useId();
  return (
    <svg className="ask-sparkle" data-busy={busy} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--ai-4)" }} />
          <stop offset="0.5" style={{ stopColor: "var(--ai-3)" }} />
          <stop offset="1" style={{ stopColor: "var(--ai-2)" }} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 2C12.6 7.4 16.6 11.4 22 12C16.6 12.6 12.6 16.6 12 22C11.4 16.6 7.4 12.6 2 12C7.4 11.4 11.4 7.4 12 2Z"
      />
    </svg>
  );
}
