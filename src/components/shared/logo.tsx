import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizes[size], className)}
      aria-label="Constitution Builder"
    >
      {/* Compass & Square mark */}
      <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Square (L-shaped) */}
        <path
          d="M25 75 L25 25 L75 25"
          stroke="var(--color-brass)"
        />
        {/* Compass (V-shaped with arc) */}
        <path
          d="M30 20 L50 80 L70 20"
          stroke="var(--color-blueprint)"
        />
        {/* Compass arc */}
        <path
          d="M38 50 A15 15 0 0 1 62 50"
          stroke="var(--color-blueprint)"
        />
        {/* Center point */}
        <circle cx="50" cy="45" r="3" fill="var(--color-brass)" />
      </g>
    </svg>
  );
}

export function LogoWithText({ size = "md", className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Logo size={size} />
      <span className="font-display font-semibold text-stone-950 tracking-tight">
        Constitution Builder
      </span>
    </div>
  );
}
