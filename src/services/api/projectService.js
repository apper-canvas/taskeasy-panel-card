// Mock data removed - starting with empty projects array

class ProjectService {
  constructor() {
this.projects = [];
  }

  async getAll() {
    await this.delay(300);
    return [...this.projects];
  }

  async getById(id) {
    await this.delay(200);
    const project = this.projects.find(p => p.id === parseInt(id));
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    return { ...project };
  }

  async create(projectData) {
    await this.delay(400);
    
    const newProject = {
      id: Math.max(...this.projects.map(p => p.id), 0) + 1,
      ...projectData,
      status: "Active",
      completionPercentage: 0,
      createdAt: new Date().toISOString()
    };
    
    this.projects.push(newProject);
    return { ...newProject };
  }

async update(id, projectData) {
    await this.delay(350);
    
    const index = this.projects.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    const previousProject = { ...this.projects[index] };
    
    this.projects[index] = {
      ...this.projects[index],
      ...projectData,
      id: parseInt(id) // Ensure id remains integer
    };
    
    const updatedProject = { ...this.projects[index] };
    
    // Check if project completion status might have changed
    // This will be properly detected in the Projects component
    // when it compares task completion ratios
    
    return updatedProject;
  }

  async delete(id) {
    await this.delay(300);
    
    const index = this.projects.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    const deletedProject = this.projects.splice(index, 1)[0];
    return { ...deletedProject };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const projectService = new ProjectService();