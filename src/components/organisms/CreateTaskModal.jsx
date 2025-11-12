import React, { useState, useEffect } from "react";
import Modal from "@/components/organisms/Modal";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import { taskService } from "@/services/api/taskService";
import { projectService } from "@/services/api/projectService";
import { teamService } from "@/services/api/teamService";
import { toast } from "react-toastify";

const CreateTaskModal = ({ task = null, projectId = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    projectId: projectId || "",
    name: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: "",
    status: "To Do"
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProjects();
    loadTeamMembers();
    
    if (task) {
      setFormData({
        projectId: task.projectId || "",
        name: task.name || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        assignedTo: task.assignedTo || "",
        status: task.status || "To Do"
      });
    }
  }, [task, projectId]);

  const loadProjects = async () => {
    try {
      const projectList = await projectService.getAll();
      setProjects(projectList);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

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
    
    if (!formData.projectId) {
      newErrors.projectId = "Project is required";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    if (!formData.assignedTo) {
      newErrors.assignedTo = "Please assign to a team member";
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
      const taskData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString()
      };

      if (task) {
        await taskService.update(task.id, taskData);
        toast.success("Task updated successfully!");
      } else {
        await taskService.create(taskData);
        toast.success("Task created successfully!");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save task:", error);
      toast.error("Failed to save task");
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

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={task ? "Edit Task" : "Create New Task"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Project"
          value={formData.projectId}
          onChange={(e) => handleChange("projectId", e.target.value)}
          error={errors.projectId}
          required
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>

        <Input
          label="Task Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="Enter task name"
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-secondary-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter task description"
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            required
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            error={errors.dueDate}
            required
          />

          <Select
            label="Assign To"
            value={formData.assignedTo}
            onChange={(e) => handleChange("assignedTo", e.target.value)}
            error={errors.assignedTo}
            required
          >
            <option value="">Select team member</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role})
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;