import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(({ 
  label,
  error,
  children,
  className = "",
  ...props 
}, ref) => {
  const baseStyles = "w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200";
  
  const errorStyles = error ? "border-error-500 focus:ring-error-500 focus:border-error-500" : "";
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      
      <select
        ref={ref}
        className={cn(baseStyles, errorStyles, className)}
        {...props}
      >
        {children}
      </select>
      
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;