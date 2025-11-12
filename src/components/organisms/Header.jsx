import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { notificationService } from "@/services/api/notificationService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import NotificationBell from "@/components/molecules/NotificationBell";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const Header = ({ onSearch, onAddClick }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Local notification state management
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotificationLoading(true);
        const data = await notificationService.getAll();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setNotificationLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const navItems = [
{ path: "/", label: "Dashboard", icon: "LayoutDashboard" },
    { path: "/projects", label: "Projects", icon: "FolderOpen" },
    { path: "/team", label: "Team", icon: "Users" },
    { path: "/chats", label: "Chats", icon: "MessageCircle" }
  ];

  const handleSearch = (term) => {
    setSearchTerm(term);
    onSearch?.(term);
  };

  const getAddButtonLabel = () => {
    switch (location.pathname) {
      case "/projects":
        return "New Project";
      case "/team":
        return "Add Member";
      default:
        return "Quick Add";
    }
  };

  const getAddButtonIcon = () => {
    switch (location.pathname) {
      case "/projects":
        return "FolderPlus";
      case "/team":
        return "UserPlus";
      default:
        return "Plus";
    }
  };

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="CheckSquare" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gradient">TaskEasy</h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary-100 text-primary-700 border-b-2 border-primary-600"
                        : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
                    )}
                  >
                    <ApperIcon name={item.icon} className="w-4 h-4" />
                    {item.label}
                  </Link>
);
              })}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden sm:block w-64">
              <SearchBar
                placeholder="Search tasks, projects..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>

            {/* Notifications */}
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />

            {/* Add Button */}
            <Button
              onClick={onAddClick}
              icon={getAddButtonIcon()}
              className="hidden sm:inline-flex"
            >
              {getAddButtonLabel()}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="md:hidden p-2"
              onClick={() => {
                // Mobile menu toggle would go here
              }}
            >
              <ApperIcon name="Menu" className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-4">
          <SearchBar
            placeholder="Search tasks, projects..."
            onSearch={handleSearch}
            className="w-full"
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-secondary-200 bg-secondary-50">
        <nav className="flex items-center justify-around py-2">
{navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-100 text-primary-700"
                    : "text-secondary-600 hover:text-secondary-900"
                )}
              >
                <ApperIcon name={item.icon} className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddClick}
            className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium text-primary-600"
          >
            <ApperIcon name={getAddButtonIcon()} className="w-5 h-5" />
            Add
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;