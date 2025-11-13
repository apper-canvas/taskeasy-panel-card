import React, { useEffect, useState } from "react";
import { projectService } from "@/services/api/projectService";
import { teamService } from "@/services/api/teamService";
import { toast } from "react-toastify";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import Team from "@/components/pages/Team";
import Modal from "@/components/organisms/Modal";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const CreateProjectModal = ({ project = null, onClose, onSuccess }) => {
const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    dueDate: "",
    assignedMembers: []
  });
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTeamMembers();
    
    if (project) {
setFormData({
        name: project.name || "",
        description: project.description || "",
        startDate: project.startDate ? project.startDate.split("T")[0] : "",
        dueDate: project.dueDate ? project.dueDate.split("T")[0] : "",
        assignedMembers: Array.isArray(project.assignedMembers) ? project.assignedMembers : []
      });
    }
  }, [project]);

  const loadTeamMembers = async () => {
    try {
      const members = await teamService.getAll();
      setTeamMembers(members);
    } catch (error) {
      console.error("Failed to load team members:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    if (formData.startDate && formData.dueDate && new Date(formData.startDate) > new Date(formData.dueDate)) {
      newErrors.dueDate = "Due date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
const projectData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        assignedMembers: Array.isArray(formData.assignedMembers) ? formData.assignedMembers : []
      };

      if (project) {
        await projectService.update(project.id, projectData);
        toast.success("Project updated successfully!");
      } else {
        await projectService.create(projectData);
        toast.success("Project created successfully!");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save project:", error);
      toast.error("Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const memberOptions = teamMembers.map(member => ({
    value: member.id,
    label: `${member.name} (${member.role})`
  }));

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={project ? "Edit Project" : "Create New Project"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="Enter project name"
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-secondary-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter project description"
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            error={errors.startDate}
            required
          />

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            error={errors.dueDate}
            required
          />
        </div>

<div className="space-y-1">
          <label className="block text-sm font-medium text-secondary-700">
            Assign Team Members {project?.status === "Completed" && (
              <span className="text-warning-600 text-xs">(Cannot modify completed projects)</span>
            )}
          </label>
          <FilterDropdown
            label="Select team members"
            options={memberOptions}
            selectedValues={Array.isArray(formData.assignedMembers) ? formData.assignedMembers : []}
            onSelectionChange={(values) => handleChange("assignedMembers", Array.isArray(values) ? values : [])}
            multiSelect={true}
            className="w-full"
            disabled={project?.status === "Completed"}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {project ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;