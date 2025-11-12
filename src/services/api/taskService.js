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
    
    return { ...this.tasks[index] };
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