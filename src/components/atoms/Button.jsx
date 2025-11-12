import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  icon = null,
  iconPosition = "left",
  loading = false,
  className = "",
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white focus:ring-primary-500 hover:shadow-lg hover:scale-105 active:scale-95",
    secondary: "bg-white border border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400 focus:ring-primary-500 hover:shadow-md hover:scale-105 active:scale-95",
    ghost: "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-800 focus:ring-primary-500 hover:scale-105 active:scale-95",
    danger: "bg-gradient-to-r from-error-600 to-error-500 hover:from-error-700 hover:to-error-600 text-white focus:ring-error-500 hover:shadow-lg hover:scale-105 active:scale-95"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
    md: "px-4 py-2 text-sm rounded-lg gap-2",
    lg: "px-6 py-3 text-base rounded-lg gap-2"
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <ApperIcon name={icon} className="w-4 h-4" />
          )}
          {children}
          {icon && iconPosition === "right" && (
            <ApperIcon name={icon} className="w-4 h-4" />
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;