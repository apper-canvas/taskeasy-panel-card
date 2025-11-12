import React, { useState, useEffect } from "react";
import Modal from "@/components/organisms/Modal";
import TaskCard from "@/components/molecules/TaskCard";
import MemberCard from "@/components/molecules/MemberCard";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ProgressBar from "@/components/atoms/ProgressBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import CreateTaskModal from "@/components/organisms/CreateTaskModal";
import { taskService } from "@/services/api/taskService";
import { teamService } from "@/services/api/teamService";
import { format } from "date-fns";

const ProjectDetailModal = ({ project, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "FileText" },
    { id: "tasks", label: "Tasks", icon: "CheckSquare" },
    { id: "team", label: "Team", icon: "Users" }
  ];

  useEffect(() => {
    if (isOpen && project) {
      loadProjectData();
    }
  }, [isOpen, project]);

  useEffect(() => {
    filterTasks();
  }, [tasks, statusFilter, priorityFilter]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [projectTasks, allMembers] = await Promise.all([
        taskService.getByProject(project.id),
        teamService.getAll()
      ]);

      setTasks(projectTasks);
      
      // Filter team members assigned to this project
      const assignedMembers = allMembers.filter(member => 
        project.assignedMembers?.includes(member.id)
      );
      setTeamMembers(assignedMembers);
    } catch (error) {
      console.error("Failed to load project data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (statusFilter.length > 0) {
      filtered = filtered.filter(task => statusFilter.includes(task.status));
    }

    if (priorityFilter.length > 0) {
      filtered = filtered.filter(task => priorityFilter.includes(task.priority));
    }

    setFilteredTasks(filtered);
  };

  const handleTaskCreate = () => {
    setShowCreateTask(false);
    loadProjectData();
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    const todo = tasks.filter(t => t.status === "To Do").length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, todo, completionPercentage };
  };

  const renderOverview = () => {
    const stats = getTaskStats();

    return (
      <div className="space-y-6">
        {/* Project Info */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-primary-900">{project.name}</h3>
              {project.description && (
                <p className="text-primary-700 mt-2">{project.description}</p>
              )}
            </div>
            <Badge variant="primary">Active</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-primary-600">Start Date</p>
              <p className="font-medium text-primary-900">
                {format(new Date(project.startDate), "MMM d, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-600">Due Date</p>
              <p className="font-medium text-primary-900">
                {format(new Date(project.dueDate), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h4 className="font-semibold text-secondary-900 mb-4">Project Progress</h4>
          <ProgressBar 
            value={stats.completionPercentage} 
            showLabel={true}
            color={stats.completionPercentage === 100 ? "success" : "primary"}
            className="mb-4"
          />
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
              <p className="text-sm text-secondary-600">Total Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
              <p className="text-sm text-secondary-600">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">{stats.inProgress}</p>
              <p className="text-sm text-secondary-600">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-600">{stats.todo}</p>
              <p className="text-sm text-secondary-600">To Do</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    const statusOptions = [
      { value: "To Do", label: "To Do" },
      { value: "In Progress", label: "In Progress" },
      { value: "Completed", label: "Completed" }
    ];

    const priorityOptions = [
      { value: "Low", label: "Low Priority" },
      { value: "Medium", label: "Medium Priority" },
      { value: "High", label: "High Priority" }
    ];

    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FilterDropdown
              label="Status"
              options={statusOptions}
              selectedValues={statusFilter}
              onSelectionChange={setStatusFilter}
            />
            <FilterDropdown
              label="Priority"
              options={priorityOptions}
              selectedValues={priorityFilter}
              onSelectionChange={setPriorityFilter}
            />
          </div>
          <Button
            onClick={() => setShowCreateTask(true)}
            icon="Plus"
            size="sm"
          >
            Add Task
          </Button>
        </div>

        {/* Tasks List */}
        {loading ? (
          <Loading type="skeleton" />
        ) : filteredTasks.length === 0 ? (
          <Empty
            title="No tasks found"
            description={tasks.length === 0 ? "Create your first task to get started" : "No tasks match your current filters"}
            actionLabel="Add Task"
            onAction={() => setShowCreateTask(true)}
            icon="CheckSquare"
          />
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => {
              const assignedMember = teamMembers.find(m => m.id === task.assignedTo);
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  assignedMember={assignedMember}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderTeam = () => {
    return (
      <div className="space-y-4">
        {teamMembers.length === 0 ? (
          <Empty
            title="No team members assigned"
            description="This project doesn't have any team members assigned yet"
            icon="Users"
          />
        ) : (
          <div className="grid gap-4">
            {teamMembers.map((member) => {
              const memberTaskCount = tasks.filter(t => t.assignedTo === member.id && t.status !== "Completed").length;
              return (
                <MemberCard
                  key={member.id}
                  member={member}
                  taskCount={memberTaskCount}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={project?.name || "Project Details"}
        maxWidth="xl"
      >
        {/* Tabs */}
        <div className="border-b border-secondary-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-secondary-500 hover:text-secondary-700"
                }`}
              >
                <ApperIcon name={tab.icon} className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "tasks" && renderTasks()}
          {activeTab === "team" && renderTeam()}
        </div>
      </Modal>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          projectId={project?.id}
          onClose={() => setShowCreateTask(false)}
          onSuccess={handleTaskCreate}
        />
      )}
    </>
  );
};

export default ProjectDetailModal;