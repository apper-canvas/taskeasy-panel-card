import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No items found",
  description = "Get started by adding your first item",
  actionLabel = "Add New",
  onAction = null,
  icon = "Inbox",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
          <ApperIcon name={icon} className="w-10 h-10 text-primary-600" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-secondary-900 mb-2">
        {title}
      </h3>
      
      <p className="text-secondary-600 mb-6 max-w-md">
        {description}
      </p>
      
{onAction && (
        <button
          onClick={onAction}
          className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 inline-flex items-center gap-2"
        >
          <ApperIcon name="Plus" className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default Empty;