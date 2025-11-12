import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Input = forwardRef(({ 
  label,
  error,
  icon,
  iconPosition = "left",
  className = "",
  ...props 
}, ref) => {
  const baseStyles = "w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200";
  
  const errorStyles = error ? "border-error-500 focus:ring-error-500 focus:border-error-500" : "";
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} className="w-4 h-4 text-secondary-400" />
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            baseStyles,
            errorStyles,
            icon && iconPosition === "left" ? "pl-10" : "",
            icon && iconPosition === "right" ? "pr-10" : "",
            className
          )}
          {...props}
        />
        
        {icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} className="w-4 h-4 text-secondary-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;