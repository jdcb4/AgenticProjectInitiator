import { type ElementType, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Typography primitives. Use these instead of writing text-related Tailwind
 * classes (text-3xl, font-semibold, tracking-tight, font-mono, ...).
 *
 * If you need a new variant, add a token in src/styles/tokens.css, expose it
 * in tailwind.config.ts, then add a primitive here. Do NOT write the size or
 * weight inline.
 */

type HeadingLevel = 1 | 2 | 3 | 4;

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  display?: boolean;
  children: ReactNode;
}

const headingClasses: Record<HeadingLevel, string> = {
  1: "text-h1 font-semibold",
  2: "text-h2 font-semibold",
  3: "text-h3 font-medium",
  4: "text-h4 font-medium",
};

export function Heading({
  level,
  display = false,
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = `h${level}` as ElementType;
  const sizeClass = display ? "text-display font-bold" : headingClasses[level];
  return (
    <Tag className={cn(sizeClass, "text-text-primary", className)} {...rest}>
      {children}
    </Tag>
  );
}

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children: ReactNode;
}

export function Body({ as: Tag = "p", className, children, ...rest }: TextProps) {
  return (
    <Tag className={cn("text-body text-text-primary", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Subtle({ as: Tag = "p", className, children, ...rest }: TextProps) {
  return (
    <Tag className={cn("text-body-sm text-text-secondary", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Caption({
  as: Tag = "span",
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <Tag
      className={cn("text-caption uppercase text-text-subtle", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Code({ as: Tag = "code", className, children, ...rest }: TextProps) {
  return (
    <Tag
      className={cn(
        "font-mono text-body-sm text-text-primary rounded-sm bg-surface-raised px-1 py-0.5",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
