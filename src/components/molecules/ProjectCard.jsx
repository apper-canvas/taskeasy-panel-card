import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/atoms/ProgressBar";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { format, isAfter } from "date-fns";

const ProjectCard = ({
  project,
  taskCount = 0,
  completedTaskCount = 0,
  assignedMembers = [],
  onEdit,
  onDelete,
  onViewDetails,
  className = ""
}) => {
  const completionPercentage = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;
  const isOverdue = isAfter(new Date(), new Date(project.dueDate)) && completionPercentage < 100;

  return (
    <Card hoverable className={cn("p-6 cursor-pointer", className)} onClick={() => onViewDetails?.(project)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-secondary-900 truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(project);
              }}
              className="p-1"
            >
              <ApperIcon name="Edit2" className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(project.id);
              }}
              className="p-1 text-error-500 hover:text-error-700"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-600">Progress</span>
            <span className="font-medium text-secondary-900">{completionPercentage}%</span>
          </div>
          <ProgressBar 
            value={completionPercentage} 
            color={completionPercentage === 100 ? "success" : "primary"}
          />
        </div>

        {/* Task Count */}
        <div className="flex items-center gap-4 text-sm text-secondary-600">
          <div className="flex items-center gap-1">
            <ApperIcon name="CheckSquare" className="w-4 h-4" />
            <span>{taskCount} tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <ApperIcon name="CheckCircle" className="w-4 h-4" />
            <span>{completedTaskCount} completed</span>
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ApperIcon name="Calendar" className="w-4 h-4 text-secondary-500" />
            <span className={cn(
              "text-secondary-600",
              isOverdue && "text-error-600 font-medium"
            )}>
              Due: {format(new Date(project.dueDate), "MMM d, yyyy")}
            </span>
          </div>
          {isOverdue && (
            <Badge variant="error" size="sm">
              Overdue
            </Badge>
          )}
        </div>

        {/* Team Members */}
        {assignedMembers.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-secondary-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary-600">Team:</span>
              <div className="flex -space-x-2">
                {assignedMembers.slice(0, 3).map((member, index) => (
                  <Avatar
                    key={member.id}
                    name={member.name}
                    src={member.photoUrl}
                    size="sm"
                    className="border-2 border-white"
                  />
                ))}
                {assignedMembers.length > 3 && (
                  <div className="w-8 h-8 bg-secondary-100 text-secondary-600 text-xs font-medium rounded-full flex items-center justify-center border-2 border-white">
                    +{assignedMembers.length - 3}
                  </div>
                )}
              </div>
            </div>
<Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(project);
              }}
              className="text-primary-600 hover:text-primary-700"
            >
              View Details
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProjectCard;