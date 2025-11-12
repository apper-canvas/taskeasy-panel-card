// Mock data removed - starting with empty team array

class TeamService {
  constructor() {
this.members = [];
  }

  async getAll() {
    await this.delay(300);
    return [...this.members];
  }

  async getById(id) {
    await this.delay(200);
    const member = this.members.find(m => m.id === parseInt(id));
    if (!member) {
      throw new Error(`Team member with id ${id} not found`);
    }
    return { ...member };
  }

  async create(memberData) {
    await this.delay(400);
    
    // Check for duplicate email
    const existingMember = this.members.find(m => m.email.toLowerCase() === memberData.email.toLowerCase());
    if (existingMember) {
      throw new Error("A team member with this email already exists");
    }
    
    const newMember = {
      id: Math.max(...this.members.map(m => m.id), 0) + 1,
      ...memberData,
      createdAt: new Date().toISOString()
    };
    
    this.members.push(newMember);
    return { ...newMember };
  }

  async update(id, memberData) {
    await this.delay(350);
    
    const index = this.members.findIndex(m => m.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Team member with id ${id} not found`);
    }
    
    // Check for duplicate email (excluding current member)
    if (memberData.email) {
      const existingMember = this.members.find(m => 
        m.id !== parseInt(id) && m.email.toLowerCase() === memberData.email.toLowerCase()
      );
      if (existingMember) {
        throw new Error("A team member with this email already exists");
      }
    }
    
    this.members[index] = {
      ...this.members[index],
      ...memberData,
      id: parseInt(id) // Ensure id remains integer
    };
    
    return { ...this.members[index] };
  }

  async delete(id) {
    await this.delay(300);
    
    const index = this.members.findIndex(m => m.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Team member with id ${id} not found`);
    }
    
    const deletedMember = this.members.splice(index, 1)[0];
    return { ...deletedMember };
  }

  async getByRole(role) {
    await this.delay(250);
    return this.members
      .filter(m => m.role.toLowerCase() === role.toLowerCase())
      .map(m => ({ ...m }));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const teamService = new TeamService();