import React, { useState, useRef, useEffect } from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const FilterDropdown = ({
  label = "Filter",
  options = [],
  selectedValues = [],
  onSelectionChange,
  multiSelect = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionToggle = (value) => {
    if (multiSelect) {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onSelectionChange?.(newValues);
    } else {
      onSelectionChange?.([value]);
      setIsOpen(false);
    }
  };

  const getButtonText = () => {
    if (selectedValues.length === 0) return label;
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        icon="ChevronDown"
        iconPosition="right"
        className={cn(
          "min-w-32",
          isOpen && "ring-2 ring-primary-500"
        )}
      >
        {getButtonText()}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50 animate-scale-in">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionToggle(option.value)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-3"
            >
              {multiSelect && (
                <div className={cn(
                  "w-4 h-4 border-2 rounded flex items-center justify-center",
                  selectedValues.includes(option.value)
                    ? "bg-primary-600 border-primary-600"
                    : "border-secondary-300"
                )}>
                  {selectedValues.includes(option.value) && (
                    <ApperIcon name="Check" className="w-3 h-3 text-white" />
                  )}
                </div>
              )}
              <span className={cn(
                selectedValues.includes(option.value) && !multiSelect && "text-primary-600 font-medium"
              )}>
                {option.label}
              </span>
            </button>
          ))}
          
          {options.length === 0 && (
            <div className="px-4 py-3 text-sm text-secondary-500 text-center">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;