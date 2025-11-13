import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { projectService } from "@/services/api/projectService";
import { taskService } from "@/services/api/taskService";
import { teamService } from "@/services/api/teamService";
import { endOfWeek, format, isAfter, startOfWeek } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ProjectCard from "@/components/molecules/ProjectCard";
import TaskCard from "@/components/molecules/TaskCard";
import Projects from "@/components/pages/Projects";
import Team from "@/components/pages/Team";
import ConfirmModal from "@/components/organisms/ConfirmModal";
import CreateTaskModal from "@/components/organisms/CreateTaskModal";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/atoms/ProgressBar";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";

const Dashboard = () => {
  const { searchTerm } = useOutletContext() || {};
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus });
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
      loadDashboardData();
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await taskService.delete(taskToDelete);
      toast.success("Task deleted successfully");
      setTaskToDelete(null);
      loadDashboardData();
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Dashboard calculations
const getProjectStats = async () => {
    // Return zero stats when no projects exist
    if (!projects || projects.length === 0) {
      return { 
        totalProjects: 0, 
        activeProjects: 0, 
        completedProjects: 0,
        projectProgress: 0 
      };
    }

    // Filter out any sample/mock data - only count user-created projects
    const userProjects = projects.filter(project => 
      project && 
      project.name && 
      project.name.trim() !== '' &&
      !project.name.toLowerCase().includes('sample') &&
      !project.name.toLowerCase().includes('example') &&
      !project.name.toLowerCase().includes('demo')
    );

    // If no real user projects exist, return zero counts
    if (userProjects.length === 0) {
      return { 
        totalProjects: 0, 
        activeProjects: 0, 
        completedProjects: 0,
        projectProgress: 0 
      };
    }

const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter(p => p.status === "Active").length;
    const completedProjects = userProjects.filter(p => p.status === "Completed").length;
    
    try {
      // Get actual task data from service
      const allTasks = await taskService.getAll();
        
      // Filter out any sample/mock data - only count user-created tasks
      // Assuming user-created tasks have meaningful data vs. placeholder content
      const userTasks = allTasks.filter(task => 
        task && 
        task.title && 
        task.title.trim() !== '' &&
        !task.title.toLowerCase().includes('sample') &&
        !task.title.toLowerCase().includes('example') &&
        !task.title.toLowerCase().includes('demo')
      );
      
      // If no real user tasks exist, return zero counts
      if (userTasks.length === 0) {
        return {
          totalProjects,
          activeProjects,
          completedProjects,
          completedTasks: 0,
          inProgressTasks: 0,
          overdueTasks: 0
        };
      }
      
      // Calculate task statistics from real user data only
      const completedTasks = userTasks.filter(task => task.status === "Completed").length;
      const inProgressTasks = userTasks.filter(task => task.status === "In Progress").length;
      
      // Calculate overdue tasks (past due date and not completed)
      const currentDate = new Date();
      const overdueTasks = userTasks.filter(task => {
        if (task.status === "Completed") return false;
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < currentDate;
      }).length;
      
      return { 
        totalProjects, 
        activeProjects,
        completedProjects,
        completedTasks, 
        inProgressTasks, 
        overdueTasks 
      };
    } catch (error) {
      // If service fails, return zero counts
      return {
        totalProjects,
        activeProjects,
        completedProjects,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0
      };
    }
  };

const getTaskStats = () => {
    // Return zero stats when no tasks exist
    if (!tasks || tasks.length === 0) {
      return { 
        totalTasks: 0, 
        completedTasks: 0, 
        inProgressTasks: 0, 
        todoTasks: 0, 
        overdueTasks: 0 
      };
    }

// Filter out any sample/mock data - only count user-created tasks
    // Assuming user-created tasks have meaningful data vs. placeholder content
    const userTasks = tasks.filter(task => 
      task && 
      task.title && 
      task.title.trim() !== '' &&
      !task.title.toLowerCase().includes('sample') &&
      !task.title.toLowerCase().includes('example') &&
      !task.title.toLowerCase().includes('demo')
    );
    // If no real user tasks exist, return zero counts
    if (userTasks.length === 0) {
      return { 
        totalTasks: 0, 
        completedTasks: 0, 
        inProgressTasks: 0, 
        todoTasks: 0, 
        overdueTasks: 0 
      };
    }

    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.status === "Completed").length;
    const inProgressTasks = userTasks.filter(t => t.status === "In Progress").length;
    const todoTasks = userTasks.filter(t => t.status === "To Do").length;
    const overdueTasks = userTasks.filter(t => 
      isAfter(new Date(), new Date(t.dueDate)) && t.status !== "Completed"
    ).length;

    return { totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks };
  };

  const getUpcomingTasks = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= weekStart && dueDate <= weekEnd && task.status !== "Completed";
    }).slice(0, 5);
  };

  const getRecentProjects = () => {
    return projects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  };

  const getTeamProductivity = () => {
    return teamMembers.map(member => {
      const memberTasks = tasks.filter(t => t.assignedTo === member.id);
      const completedTasks = memberTasks.filter(t => t.status === "Completed");
      const completionRate = memberTasks.length > 0 ? (completedTasks.length / memberTasks.length) * 100 : 0;
      
      return {
        ...member,
        totalTasks: memberTasks.length,
        completedTasks: completedTasks.length,
        completionRate: Math.round(completionRate)
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
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
        <ErrorView error={error} onRetry={loadDashboardData} />
      </div>
    );
  }

const projectStats = getProjectStats();
  const taskStats = getTaskStats();
  const upcomingTasks = getUpcomingTasks();
  const recentProjects = getRecentProjects();
  const teamProductivity = getTeamProductivity();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
          <p className="text-secondary-600 mt-1">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 font-medium">Total Projects</p>
              <p className="text-2xl font-bold text-primary-900">{projectStats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
              <ApperIcon name="FolderOpen" className="w-6 h-6 text-primary-700" />
            </div>
          </div>
        </Card>

<Card 
          className="p-6 bg-gradient-to-br from-success-50 to-success-100 border-success-200 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          onClick={() => navigate('/tasks?status=completed')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-success-600 font-medium">Completed Tasks</p>
              <p className="text-2xl font-bold text-success-900">{taskStats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-success-200 rounded-full flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="w-6 h-6 text-success-700" />
            </div>
          </div>
        </Card>

<Card 
          className="p-6 bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          onClick={() => navigate('/tasks?status=in-progress')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warning-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-warning-900">{taskStats.inProgressTasks}</p>
            </div>
            <div className="w-12 h-12 bg-warning-200 rounded-full flex items-center justify-center">
              <ApperIcon name="Clock" className="w-6 h-6 text-warning-700" />
            </div>
          </div>
        </Card>

<Card 
          className="p-6 bg-gradient-to-br from-error-50 to-error-100 border-error-200 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          onClick={() => navigate('/tasks?status=overdue')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-error-600 font-medium">Overdue Tasks</p>
              <p className="text-2xl font-bold text-error-900">{taskStats.overdueTasks}</p>
            </div>
            <div className="w-12 h-12 bg-error-200 rounded-full flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="w-6 h-6 text-error-700" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900">Upcoming Tasks</h2>
              <Button variant="ghost" onClick={() => navigate("/projects")}>
                View All
              </Button>
            </div>

            {upcomingTasks.length === 0 ? (
              <Empty
                title="No upcoming tasks"
                description="You're all caught up! No tasks due this week."
                icon="CheckCircle"
              />
            ) : (
              <div className="space-y-4">
                {upcomingTasks.map((task) => {
                  const assignedMember = teamMembers.find(m => m.id === task.assignedTo);
                  const isOverdue = isAfter(new Date(), new Date(task.dueDate));
                  
                  return (
<div key={task.id} className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-secondary-900 truncate">{task.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant={task.priority.toLowerCase()}>
                            {task.priority}
                          </Badge>
                          <span className={`text-sm ${isOverdue ? "text-error-600 font-medium" : "text-secondary-600"}`}>
                            Due: {format(new Date(task.dueDate), "MMM d")}
                          </span>
                        </div>
                      </div>
                      {assignedMember && (
                        <Avatar
                          name={assignedMember.name}
                          src={assignedMember.photoUrl}
                          size="sm"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTaskStatusChange(task.id, "Completed")}
                        className="text-success-600 hover:bg-success-50"
                      >
                        <ApperIcon name="Check" className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Team Productivity */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900">Team Performance</h2>
              <Button variant="ghost" onClick={() => navigate("/team")}>
                View All
              </Button>
            </div>

            {teamProductivity.length === 0 ? (
              <Empty
                title="No team members"
                description="Add team members to see their performance"
                actionLabel="Add Member"
                onAction={() => navigate("/team")}
                icon="Users"
              />
            ) : (
              <div className="space-y-4">
                {teamProductivity.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar
                      name={member.name}
                      src={member.photoUrl}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">{member.name}</p>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={member.completionRate}
                          size="sm"
                          className="flex-1"
                        />
                        <span className="text-xs text-secondary-600 w-12 text-right">
                          {member.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Projects */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary-900">Recent Projects</h2>
          <Button variant="ghost" onClick={() => navigate("/projects")}>
            View All Projects
          </Button>
        </div>

        {recentProjects.length === 0 ? (
          <Empty
            title="No projects yet"
            description="Create your first project to get started with task management"
            actionLabel="Create Project"
            onAction={() => navigate("/projects")}
            icon="FolderPlus"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const completedTasks = projectTasks.filter(t => t.status === "Completed");
              const assignedMembers = teamMembers.filter(m => project.assignedMembers?.includes(m.id));

              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  taskCount={projectTasks.length}
                  completedTaskCount={completedTasks.length}
                  assignedMembers={assignedMembers}
                  onViewDetails={() => navigate("/projects")}
                />
              );
            })}
          </div>
        )}
      </Card>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onSuccess={() => {
            setShowCreateTask(false);
            loadDashboardData();
          }}
        />
      )}

      {taskToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleDeleteTask}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
};

export default Dashboard;