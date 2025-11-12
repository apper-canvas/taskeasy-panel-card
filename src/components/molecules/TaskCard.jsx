import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { format, isAfter } from "date-fns";

const TaskCard = ({
  task,
  assignedMember,
  onEdit,
  onDelete,
  onStatusChange,
  onReassign,
  className = ""
}) => {
  const isOverdue = isAfter(new Date(), new Date(task.dueDate)) && task.status !== "Completed";

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "";
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "completed";
      case "in progress":
        return "progress";
      case "to do":
        return "todo";
      default:
        return "todo";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      default:
        return "low";
    }
  };

  return (
    <Card className={cn("p-4", getPriorityClass(task.priority), className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-semibold text-secondary-900 truncate",
              task.status === "Completed" && "line-through text-secondary-500"
            )}>
              {task.name}
            </h4>
            {task.description && (
              <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(task)}
              className="p-1"
            >
              <ApperIcon name="Edit2" className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(task.id)}
              className="p-1 text-error-500 hover:text-error-700"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getStatusVariant(task.status)}>
            {task.status}
          </Badge>
          <Badge variant={getPriorityVariant(task.priority)}>
            {task.priority}
          </Badge>
          {isOverdue && (
            <Badge variant="error">
              <ApperIcon name="AlertTriangle" className="w-3 h-3 mr-1" />
              Overdue
            </Badge>
          )}
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <ApperIcon name="Calendar" className="w-4 h-4" />
          <span className={cn(isOverdue && "text-error-600 font-medium")}>
            Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
          </span>
        </div>

        {/* Assigned Member */}
        {assignedMember && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar
                name={assignedMember.name}
                src={assignedMember.photoUrl}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-secondary-900">
                  {assignedMember.name}
                </p>
                <p className="text-xs text-secondary-500">
                  {assignedMember.role}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReassign?.(task)}
              className="text-xs"
            >
              Reassign
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-secondary-100">
          {task.status !== "Completed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange?.(task.id, "Completed")}
              className="flex-1 text-success-600 hover:bg-success-50"
            >
              <ApperIcon name="CheckCircle" className="w-4 h-4" />
              Mark Complete
            </Button>
          )}
          {task.status === "To Do" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange?.(task.id, "In Progress")}
              className="flex-1 text-primary-600 hover:bg-primary-50"
            >
              <ApperIcon name="Play" className="w-4 h-4" />
              Start
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;