import { useId } from "react";

type LogoProps = {
  fundo?: "escuro" | "claro";
  className?: string;
};

export function LogoMark({ contorno, className }: { contorno: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const padrao = `listras-${id}`;

  return (
    <svg viewBox="0 0 20 36" className={className} aria-hidden="true">
      <defs>
        <pattern
          id={padrao}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(40)"
        >
          <rect width="14" height="14" fill="#ffffff" />
          <rect width="3.5" height="14" fill="#C9342E" />
          <rect x="7" width="3.5" height="14" fill="#1D2C55" />
        </pattern>
      </defs>
      <rect x="3" y="7" width="14" height="22" fill={`url(#${padrao})`} />
      <rect x="3" y="7" width="14" height="22" fill="none" stroke={contorno} strokeWidth="1.5" />
      <rect x="2" y="2" width="16" height="5" rx="1" fill={contorno} />
      <rect x="2" y="29" width="16" height="5" rx="1" fill={contorno} />
    </svg>
  );
}

export default function Logo({ fundo = "claro", className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark contorno={fundo === "escuro" ? "#ffffff" : "#1D2C55"} className="h-9 w-auto" />
      <span className="font-display text-2xl font-semibold uppercase leading-none tracking-[0.1em]">
        Barbshop
      </span>
    </span>
  );
}
