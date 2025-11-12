import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { projectService } from "@/services/api/projectService";
import { taskService } from "@/services/api/taskService";
import { teamService } from "@/services/api/teamService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ProjectCard from "@/components/molecules/ProjectCard";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import ConfirmModal from "@/components/organisms/ConfirmModal";
import CreateProjectModal from "@/components/organisms/CreateProjectModal";
import ProjectDetailModal from "@/components/organisms/ProjectDetailModal";
import Button from "@/components/atoms/Button";

const Projects = () => {
  const { searchTerm } = useOutletContext() || {};
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState([]);
  const [memberFilter, setMemberFilter] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, tasks, searchTerm, statusFilter, memberFilter]);

  const loadProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectsData, tasksData, membersData] = await Promise.all([
        projectService.getAll(),
        taskService.getAll(),
        teamService.getAll()
      ]);

      setProjects(projectsData);
      setTasks(tasksData);
      setTeamMembers(membersData);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Search filter
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const completedTasks = projectTasks.filter(t => t.status === "Completed");
        const isCompleted = projectTasks.length > 0 && completedTasks.length === projectTasks.length;
        
        if (statusFilter.includes("Active") && !isCompleted) return true;
        if (statusFilter.includes("Completed") && isCompleted) return true;
        return false;
      });
    }

    // Member filter
    if (memberFilter.length > 0) {
      filtered = filtered.filter(project =>
        project.assignedMembers?.some(memberId => memberFilter.includes(memberId))
      );
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = () => {
    setShowCreateProject(false);
    setProjectToEdit(null);
    loadProjects();
  };

  const handleEditProject = (project) => {
    setProjectToEdit(project);
    setShowCreateProject(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      // Delete all tasks in the project first
      const projectTasks = tasks.filter(t => t.projectId === projectToDelete);
      await Promise.all(projectTasks.map(task => taskService.delete(task.id)));
      
      // Then delete the project
      await projectService.delete(projectToDelete);
      toast.success("Project deleted successfully");
      setProjectToDelete(null);
      loadProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorView error={error} onRetry={loadProjects} />
      </div>
    );
  }

  const statusOptions = [
    { value: "Active", label: "Active Projects" },
    { value: "Completed", label: "Completed Projects" }
  ];

  const memberOptions = teamMembers.map(member => ({
    value: member.id,
    label: member.name
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Projects</h1>
          <p className="text-secondary-600 mt-1">
            Manage your projects and track their progress
          </p>
        </div>
        <Button onClick={() => setShowCreateProject(true)} icon="Plus">
          New Project
        </Button>
      </div>

{/* Filters */}
      {projects.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-secondary-200">
          <div className="flex items-center gap-2">
            <ApperIcon name="Filter" className="w-5 h-5 text-secondary-500" />
            <span className="text-sm font-medium text-secondary-700">Filters:</span>
          </div>
          
          <FilterDropdown
            label="Status"
            options={statusOptions}
            selectedValues={statusFilter}
            onSelectionChange={setStatusFilter}
          />

          <FilterDropdown
            label="Team Member"
            options={memberOptions}
            selectedValues={memberFilter}
            onSelectionChange={setMemberFilter}
          />

          {(statusFilter.length > 0 || memberFilter.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter([]);
                setMemberFilter([]);
              }}
            >
              Clear Filters
            </Button>
          )}

          <div className="ml-auto text-sm text-secondary-600">
            {filteredProjects.length} of {projects.length} projects
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Empty
          title={projects.length === 0 ? "No projects yet" : "No projects found"}
          description={
            projects.length === 0
              ? "Create your first project to start organizing your tasks and team collaboration"
              : searchTerm
              ? "No projects match your search criteria. Try adjusting your search or filters."
              : "No projects match your current filters. Try adjusting your filter criteria."
          }
          actionLabel="Create Project"
          onAction={() => setShowCreateProject(true)}
          icon="FolderPlus"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === "Completed");
            const assignedMembers = teamMembers.filter(m => 
              project.assignedMembers?.includes(m.id)
            );

            return (
              <ProjectCard
                key={project.id}
                project={project}
                taskCount={projectTasks.length}
                completedTaskCount={completedTasks.length}
                assignedMembers={assignedMembers}
                onEdit={handleEditProject}
                onDelete={setProjectToDelete}
                onViewDetails={handleViewDetails}
              />
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreateProject && (
        <CreateProjectModal
          project={projectToEdit}
          onClose={() => {
            setShowCreateProject(false);
            setProjectToEdit(null);
          }}
          onSuccess={handleCreateProject}
        />
      )}

      {showProjectDetail && selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={showProjectDetail}
          onClose={() => {
            setShowProjectDetail(false);
            setSelectedProject(null);
          }}
        />
      )}

      {projectToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setProjectToDelete(null)}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          message="Are you sure you want to delete this project? This will also delete all associated tasks. This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
};

export default Projects;