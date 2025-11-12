import React from "react";
import Modal from "@/components/organisms/Modal";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false
}) => {
  const variants = {
    danger: {
      icon: "AlertTriangle",
      iconColor: "text-error-500",
      confirmVariant: "danger"
    },
    warning: {
      icon: "AlertCircle",
      iconColor: "text-warning-500", 
      confirmVariant: "primary"
    },
    info: {
      icon: "Info",
      iconColor: "text-primary-500",
      confirmVariant: "primary"
    }
  };

  const config = variants[variant] || variants.danger;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className="mb-4">
          <div className={cn(
            "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
            variant === "danger" ? "bg-error-100" : 
            variant === "warning" ? "bg-warning-100" : "bg-primary-100"
          )}>
            <ApperIcon 
              name={config.icon} 
              className={cn("w-8 h-8", config.iconColor)} 
            />
          </div>
        </div>

        <p className="text-secondary-600 mb-6">
          {message}
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={config.confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;