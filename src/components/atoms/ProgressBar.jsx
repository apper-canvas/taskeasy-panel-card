import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const ProgressBar = forwardRef(({ 
  value = 0,
  max = 100,
  size = "md",
  color = "primary",
  showLabel = false,
  className = "",
  ...props 
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };
  
  const colors = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-500",
    success: "bg-gradient-to-r from-success-600 to-success-500",
    warning: "bg-gradient-to-r from-warning-600 to-warning-500",
    error: "bg-gradient-to-r from-error-600 to-error-500"
  };

  return (
    <div className={cn("w-full", className)} {...props} ref={ref}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-secondary-700">Progress</span>
          <span className="text-sm text-secondary-600">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("bg-secondary-200 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

export default ProgressBar;