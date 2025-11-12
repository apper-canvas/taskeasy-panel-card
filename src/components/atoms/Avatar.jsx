import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Avatar = forwardRef(({ 
  src,
  alt,
  name,
  size = "md",
  className = "",
  ...props 
}, ref) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg"
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const baseStyles = "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 font-medium";

  if (src) {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt || name || "Avatar"}
        className={cn(baseStyles.replace("bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700", ""), "object-cover", sizes[size], className)}
        {...props}
      />
    );
  }

  return (
    <div
      ref={ref}
      className={cn(baseStyles, sizes[size], className)}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
});

Avatar.displayName = "Avatar";

export default Avatar;