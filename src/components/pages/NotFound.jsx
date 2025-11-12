import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
            <ApperIcon name="SearchX" className="w-16 h-16 text-primary-600" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-secondary-600 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            icon="Home"
            className="w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            icon="ArrowLeft"
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
        </div>

        {/* Quick Navigation */}
        <div className="mt-12 pt-8 border-t border-secondary-200">
          <p className="text-sm text-secondary-600 mb-4">Or try one of these pages:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/projects")}
              icon="FolderOpen"
            >
              Projects
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/team")}
              icon="Users"
            >
              Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;