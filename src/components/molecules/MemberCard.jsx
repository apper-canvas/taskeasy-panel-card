import React from "react";
import Card from "@/components/atoms/Card";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MemberCard = ({
  member,
  taskCount = 0,
  onEdit,
  onDelete,
  className = ""
}) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              name={member.name}
              src={member.photoUrl}
              size="lg"
            />
            <div>
              <h3 className="font-semibold text-secondary-900">
                {member.name}
              </h3>
              <Badge variant="primary" size="sm">
                {member.role}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(member)}
              className="p-2"
            >
              <ApperIcon name="Edit2" className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(member.id)}
              className="p-2 text-error-500 hover:text-error-700"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-secondary-600">
            <ApperIcon name="Mail" className="w-4 h-4" />
            <span>{member.email}</span>
          </div>
          {member.contact && (
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <ApperIcon name="Phone" className="w-4 h-4" />
              <span>{member.contact}</span>
            </div>
          )}
        </div>

        {/* Task Count */}
        <div className="flex items-center justify-between pt-3 border-t border-secondary-100">
          <div className="flex items-center gap-2">
            <ApperIcon name="CheckSquare" className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-secondary-600">
              {taskCount} active task{taskCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span className="text-xs text-secondary-500">Available</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MemberCard;