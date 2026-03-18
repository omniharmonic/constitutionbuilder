import { cn } from "@/lib/utils/cn";
import { type HTMLAttributes } from "react";

type BadgeVariant = "default" | "blueprint" | "brass" | "success" | "caution" | "tension";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-stone-100 text-stone-600",
  blueprint: "bg-blueprint/10 text-blueprint",
  brass: "bg-brass/10 text-brass",
  success: "bg-success/10 text-success",
  caution: "bg-caution/10 text-caution",
  tension: "bg-tension/10 text-tension",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeProps };
