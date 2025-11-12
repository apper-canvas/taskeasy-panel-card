import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full";
  
  const variants = {
    default: "bg-secondary-100 text-secondary-800",
    primary: "bg-primary-100 text-primary-800",
    success: "bg-success-100 text-success-800",
    warning: "bg-warning-100 text-warning-800",
    error: "bg-error-100 text-error-800",
    todo: "status-todo",
    progress: "status-progress", 
    completed: "status-completed",
    low: "bg-blue-100 text-blue-800",
    medium: "bg-warning-100 text-warning-800",
    high: "bg-error-100 text-error-800"
  };
  
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-sm"
  };

  return (
    <span
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;