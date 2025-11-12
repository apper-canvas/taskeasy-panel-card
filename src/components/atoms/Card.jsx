import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  children,
  hoverable = false,
  className = "",
  ...props 
}, ref) => {
  const baseStyles = "bg-white rounded-lg shadow-card border border-secondary-100";
  const hoverStyles = hoverable ? "card-hover cursor-pointer" : "";

  return (
    <div
      ref={ref}
      className={cn(baseStyles, hoverStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;