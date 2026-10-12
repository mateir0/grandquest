import React from "react";

interface ShineButtonProps {
  label?: string;
  onClick?: () => void;
  /** When set, renders an anchor so CTAs keep real links (no JS navigation). */
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  bgColor?: string; // Can be hex or gradient
  disabled?: boolean;
  children?: React.ReactNode;
}

const sizeStyles: Record<
  NonNullable<ShineButtonProps["size"]>,
  { padding: string; fontSize: string }
> = {
  sm: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
  md: { padding: "0.6rem 1.4rem", fontSize: "1rem" },
  lg: { padding: "0.8rem 1.8rem", fontSize: "1.125rem" },
};

export const ShineButton: React.FC<ShineButtonProps> = ({
  label = "Shine now",
  onClick,
  href,
  className = "",
  size = "md",
  // GrantQuest: solid maroon/brass — never the demo blue gradient.
  bgColor = "linear-gradient(to right, #5c0000, #5c0000)",
  disabled = false,
  children,
}) => {
  const { padding, fontSize } = sizeStyles[size];

  // Determine whether to use solid color or gradient
  const backgroundImage = bgColor.startsWith("linear-gradient")
    ? bgColor
    : `linear-gradient(to right, ${bgColor}, ${bgColor})`;

  // GrantQuest: parchment-ink text on brass, mahogany text on hover sweep.
  const cls = `gq-shine-btn relative inline-flex items-center justify-center gap-2 font-semibold rounded-md min-w-[120px] min-h-[44px] cursor-pointer border border-[#410202] ${className}`;
  const style: React.CSSProperties = {
    backgroundImage: disabled ? "none" : backgroundImage,
    fontSize,
    padding,
  };
  const inner = (
    <>
      {children || label}
      {/* Shine sweep — transform-only, hover/focus-visible. See .gq-shine-btn in globals.css. */}
      {!disabled && <span className="gq-shine-sweep" aria-hidden="true" />}
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} onClick={onClick} className={cls} style={style}>
        {inner}
      </a>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={cls} style={style}>
      {inner}
    </button>
  );
};
