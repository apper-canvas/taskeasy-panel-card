import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { taskService } from "@/services/api/taskService";
import { projectService } from "@/services/api/projectService";
import { teamService } from "@/services/api/teamService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import TaskCard from "@/components/molecules/TaskCard";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import Dashboard from "@/components/pages/Dashboard";
import Button from "@/components/atoms/Button";

function Tasks() {
  const [searchParams] = useSearchParams();
  const { searchTerm } = useOutletContext() || {};
  const navigate = useNavigate();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Update status filter when URL params change
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData, membersData] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
        teamService.getAll()
      ]);
      
      setTasks(tasksData);
      setProjects(projectsData);
      setMembers(membersData);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

const getFilteredTasks = () => {
    // Ensure tasks is an array
    if (!Array.isArray(tasks)) {
      return [];
    }

    let filtered = tasks.filter(task => {
      // Filter out sample/mock data
      if (!task || !task.title || task.title.trim() === '' ||
          task.title.toLowerCase().includes('sample') ||
          task.title.toLowerCase().includes('example') ||
          task.title.toLowerCase().includes('demo')) {
        return false;
      }
      return true;
    });

// Continue with existing filtering logic for search and status
    // (No additional filtering needed here as search and status filters are applied below)
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        filtered = filtered.filter(task => task.status === 'Completed');
      } else if (statusFilter === 'in-progress') {
        filtered = filtered.filter(task => task.status === 'In Progress');
      } else if (statusFilter === 'overdue') {
        const currentDate = new Date();
        filtered = filtered.filter(task => {
          if (task.status === 'Completed') return false;
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < currentDate;
        });
      }
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Apply project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(task => task.projectId === parseInt(projectFilter));
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilterTitle = () => {
    switch (statusFilter) {
      case 'completed':
        return 'Completed Tasks';
      case 'in-progress':
        return 'In Progress Tasks';
      case 'overdue':
        return 'Overdue Tasks';
      default:
        return 'All Tasks';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ];

  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    ...projects.map(project => ({
      value: project.Id.toString(),
      label: project.name
    }))
  ];

  const getAssignedMember = (taskAssignedTo) => {
    return members.find(member => member.Id === taskAssignedTo);
  };

  const filteredTasks = getFilteredTasks();

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;

  return (
<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800">{getFilterTitle()}</h1>
          <p className="text-secondary-600">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
          </p>
        </div>
        
<div className="flex items-center gap-4">
          <Button
onClick={() => navigate('/team')}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-secondary-600 hover:text-secondary-800"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Team
          </Button>
        </div>
      </div>

<div className="flex flex-wrap gap-3 sm:justify-end">
        <FilterDropdown
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by Status"
        />
        <FilterDropdown
          options={priorityOptions}
          value={priorityFilter}
          onChange={setPriorityFilter}
          placeholder="Filter by Priority"
        />
        <FilterDropdown
          options={projectOptions}
          value={projectFilter}
          onChange={setProjectFilter}
          placeholder="Filter by Project"
        />
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <Empty
          icon="CheckSquare"
          title="No tasks found"
          description={
            statusFilter === 'all' && !searchTerm
              ? "No tasks have been created yet. Create your first task in a project."
              : "No tasks match your current filters. Try adjusting your search criteria."
          }
          action={
            statusFilter !== 'all' || searchTerm ? (
              <Button
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setProjectFilter('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.Id}
              task={task}
              assignedMember={getAssignedMember(task.assignedTo)}
              onEdit={() => {
                // TODO: Implement task editing
                toast.info('Task editing will be available soon');
              }}
              onDelete={() => {
                // TODO: Implement task deletion
                toast.info('Task deletion will be available soon');
              }}
              onStatusChange={() => {
                // TODO: Implement status change
                toast.info('Status change will be available soon');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Tasks;