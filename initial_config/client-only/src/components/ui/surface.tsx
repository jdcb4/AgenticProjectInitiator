import { type ElementType, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Layout primitives. Use these instead of writing background-colour, border,
 * or vertical-rhythm Tailwind classes inline. Layout-only utilities like
 * `flex`, `items-center`, `px-6` remain fine to use directly.
 */

type SurfaceVariant = "base" | "raised" | "overlay" | "sunken";

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  variant?: SurfaceVariant;
  bordered?: boolean;
  as?: ElementType;
}

const variantClasses: Record<SurfaceVariant, string> = {
  base: "bg-surface-base text-text-primary",
  raised: "bg-surface-raised text-text-primary",
  overlay: "bg-surface-overlay text-text-primary",
  sunken: "bg-surface-sunken text-text-primary",
};

export function Surface({
  variant = "base",
  bordered = false,
  as: Tag = "div",
  className,
  ...rest
}: SurfaceProps) {
  return (
    <Tag
      className={cn(
        variantClasses[variant],
        bordered && "border border-border-default rounded-md",
        className,
      )}
      {...rest}
    />
  );
}

type StackGap = "tight" | "default" | "loose" | "section";

const stackGapClasses: Record<StackGap, string> = {
  tight: "gap-2",
  default: "gap-4",
  loose: "gap-8",
  section: "gap-16",
};

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: StackGap;
  direction?: "row" | "column";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
}

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

export function Stack({
  gap = "default",
  direction = "column",
  align,
  justify,
  className,
  ...rest
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "column" ? "flex-col" : "flex-row",
        stackGapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        className,
      )}
      {...rest}
    />
  );
}
