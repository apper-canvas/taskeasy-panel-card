// Mock data removed - starting with empty team array

class TeamService {
  constructor() {
    this.members = [
      {
        id: 1,
        name: "Sarah Chen",
        email: "sarah.chen@company.com",
        role: "Frontend Developer",
        department: "Engineering",
        skills: ["React", "JavaScript", "CSS", "TypeScript"],
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        createdAt: "2024-01-15T08:00:00.000Z"
      },
      {
        id: 2,
        name: "Marcus Rodriguez",
        email: "marcus.rodriguez@company.com",
        role: "Backend Developer",
        department: "Engineering",
        skills: ["Node.js", "Python", "PostgreSQL", "Docker"],
        phone: "+1 (555) 234-5678",
        location: "Austin, TX",
        createdAt: "2024-01-20T09:30:00.000Z"
      },
      {
        id: 3,
        name: "Emma Thompson",
        email: "emma.thompson@company.com",
        role: "Product Manager",
        department: "Product",
        skills: ["Product Strategy", "Agile", "User Research", "Analytics"],
        phone: "+1 (555) 345-6789",
        location: "New York, NY",
        createdAt: "2024-01-25T10:15:00.000Z"
      },
      {
        id: 4,
        name: "David Park",
        email: "david.park@company.com",
        role: "UX Designer",
        department: "Design",
        skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
        phone: "+1 (555) 456-7890",
        location: "Seattle, WA",
        createdAt: "2024-02-01T11:00:00.000Z"
      },
      {
        id: 5,
        name: "Lisa Kumar",
        email: "lisa.kumar@company.com",
        role: "DevOps Engineer",
        department: "Engineering",
        skills: ["AWS", "Kubernetes", "CI/CD", "Monitoring"],
        phone: "+1 (555) 567-8901",
        location: "Denver, CO",
        createdAt: "2024-02-05T14:30:00.000Z"
      },
      {
        id: 6,
        name: "Alex Johnson",
        email: "alex.johnson@company.com",
        role: "Quality Assurance",
        department: "Engineering",
        skills: ["Test Automation", "Manual Testing", "Bug Tracking", "API Testing"],
        phone: "+1 (555) 678-9012",
        location: "Chicago, IL",
        createdAt: "2024-02-10T16:45:00.000Z"
      },
      {
        id: 7,
        name: "Rachel Green",
        email: "rachel.green@company.com",
        role: "Frontend Developer",
        department: "Engineering",
        skills: ["Vue.js", "React", "SCSS", "Webpack"],
        phone: "+1 (555) 789-0123",
        location: "Portland, OR",
        createdAt: "2024-02-15T13:20:00.000Z"
      },
      {
        id: 8,
        name: "Michael Brown",
        email: "michael.brown@company.com",
        role: "Product Manager",
        department: "Product",
        skills: ["Roadmap Planning", "Stakeholder Management", "Data Analysis", "Scrum"],
        phone: "+1 (555) 890-1234",
        location: "Los Angeles, CA",
        createdAt: "2024-02-20T15:10:00.000Z"
      }
    ];
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