import React, { useState, useRef, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";
import { formatDistanceToNow } from "date-fns";

const NotificationBell = ({ notifications = [], onMarkAsRead, onMarkAllAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "overdue":
        return "AlertTriangle";
      case "upcoming":
        return "Clock";
      case "reassigned":
        return "UserCheck";
      default:
        return "Bell";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "overdue":
        return "text-error-500";
      case "upcoming":
        return "text-warning-500";
      case "reassigned":
        return "text-primary-500";
      default:
        return "text-secondary-500";
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <ApperIcon name="Bell" className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 z-50 animate-scale-in">
          <div className="px-4 py-2 border-b border-secondary-100 flex items-center justify-between">
            <h3 className="font-semibold text-secondary-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onMarkAllAsRead?.();
                }}
              >
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-secondary-500">
                <ApperIcon name="Bell" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "px-4 py-3 hover:bg-secondary-50 cursor-pointer border-l-4 transition-colors",
                    notification.read ? "border-l-transparent" : "border-l-primary-500 bg-primary-50"
                  )}
                  onClick={() => {
                    if (!notification.read) {
                      onMarkAsRead?.(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5", getNotificationColor(notification.type))}>
                      <ApperIcon name={getNotificationIcon(notification.type)} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        notification.read ? "text-secondary-600" : "text-secondary-900 font-medium"
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;