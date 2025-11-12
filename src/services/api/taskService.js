import tasksData from "@/services/mockData/tasks.json";

class TaskService {
  constructor() {
    this.tasks = [...tasksData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.tasks];
  }

  async getById(id) {
    await this.delay(200);
    const task = this.tasks.find(t => t.id === parseInt(id));
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    return { ...task };
  }

  async getByProject(projectId) {
    await this.delay(250);
    return this.tasks
      .filter(t => t.projectId === String(projectId))
      .map(t => ({ ...t }));
  }

  async getByAssignee(assigneeId) {
    await this.delay(250);
    return this.tasks
      .filter(t => t.assignedTo === String(assigneeId))
      .map(t => ({ ...t }));
  }

  async create(taskData) {
    await this.delay(400);
    
    const newTask = {
      id: Math.max(...this.tasks.map(t => t.id), 0) + 1,
      ...taskData,
      createdAt: new Date().toISOString(),
      completedAt: taskData.status === "Completed" ? new Date().toISOString() : undefined
    };
    
    this.tasks.push(newTask);
    return { ...newTask };
  }

async update(id, taskData) {
    await this.delay(350);
    
    const index = this.tasks.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const originalTask = { ...this.tasks[index] };
    const updatedData = { ...taskData };
    
    // Handle completion timestamp
    if (updatedData.status === "Completed" && this.tasks[index].status !== "Completed") {
      updatedData.completedAt = new Date().toISOString();
    } else if (updatedData.status !== "Completed") {
      updatedData.completedAt = undefined;
    }
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...updatedData,
      id: parseInt(id) // Ensure id remains integer
    };
    
    const updatedTask = { ...this.tasks[index] };
    
    // Check if task was assigned to someone (new assignment or reassignment)
    const wasAssigned = originalTask.assignedTo !== updatedTask.assignedTo && updatedTask.assignedTo;
    
    if (wasAssigned) {
      // Import services dynamically to avoid circular dependencies
      const { notificationService } = await import('@/services/api/notificationService');
      const { teamService } = await import('@/services/api/teamService');
      const { projectService } = await import('@/services/api/projectService');
      
      try {
        // Get assignee details
        const assignee = await teamService.getById(updatedTask.assignedTo);
        
        if (assignee) {
          // Create in-app notification
          await notificationService.create({
            type: 'task_assigned',
            title: 'New Task Assignment',
            message: `You have been assigned to task: ${updatedTask.name}`,
            relatedId: updatedTask.id,
            relatedType: 'task',
            userId: assignee.id
          });
          
          // Send email notification via Edge function
          try {
            // Get project name if available
            let projectName = null;
            if (updatedTask.projectId) {
              try {
                const project = await projectService.getById(updatedTask.projectId);
                projectName = project?.name;
              } catch (error) {
                // Project not found, continue without project name
              }
            }
            
            // Initialize ApperClient for Edge function
            const { ApperClient } = window.ApperSDK;
            const apperClient = new ApperClient({
              apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
              apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
            });
            
            const emailResult = await apperClient.functions.invoke(import.meta.env.VITE_SEND_TASK_ASSIGNMENT_EMAIL, {
              body: JSON.stringify({
                taskName: updatedTask.name,
                taskDescription: updatedTask.description,
                assigneeName: assignee.name,
                assigneeEmail: assignee.email,
                assignerName: 'System', // Could be enhanced to track actual assigner
                dueDate: updatedTask.dueDate,
                priority: updatedTask.priority,
                projectName: projectName
              }),
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (!emailResult.success) {
              console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_SEND_TASK_ASSIGNMENT_EMAIL}. The response body is: ${JSON.stringify(emailResult)}.`);
            }
          } catch (emailError) {
            console.info(`apper_info: Got this error an this function: ${import.meta.env.VITE_SEND_TASK_ASSIGNMENT_EMAIL}. The error is: ${emailError.message}`);
          }
        }
      } catch (notificationError) {
        // Log but don't fail the task update
        console.error('Failed to send assignment notifications:', notificationError);
      }
    }
    
    return updatedTask;
  }

  async delete(id) {
    await this.delay(300);
    
    const index = this.tasks.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const deletedTask = this.tasks.splice(index, 1)[0];
    return { ...deletedTask };
  }

  async updateStatus(id, status) {
    return this.update(id, { status });
  }

  async reassign(id, assignedTo) {
    return this.update(id, { assignedTo });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const taskService = new TaskService();