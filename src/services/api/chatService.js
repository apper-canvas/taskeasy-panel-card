import messagesData from '@/services/mockData/messages.json';

class ChatService {
  constructor() {
    this.messages = [...messagesData];
  }

  // Simulate async delay for realistic behavior
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay(300);
    // Return messages sorted by timestamp (newest first)
    return [...this.messages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getByProject(projectId) {
    await this.delay(200);
    return this.messages
      .filter(message => message.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async create(messageData) {
    await this.delay(400);
    
    const newMessage = {
      Id: Math.max(0, ...this.messages.map(m => m.Id)) + 1,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderRole: messageData.senderRole || 'Team Member',
      content: messageData.content,
      timestamp: new Date().toISOString(),
      projectId: messageData.projectId || null,
      projectName: messageData.projectName || null
    };

    this.messages.push(newMessage);
    return newMessage;
  }

  async delete(id) {
    await this.delay(300);
    
    const messageIndex = this.messages.findIndex(message => message.Id === id);
    if (messageIndex === -1) {
      throw new Error('Message not found');
    }

    this.messages.splice(messageIndex, 1);
    return { success: true };
  }

  // Get recent messages for dashboard or quick view
  async getRecent(limit = 10) {
    await this.delay(200);
    return [...this.messages]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Get unique projects that have chat messages
  async getChatProjects() {
    await this.delay(150);
    const projects = this.messages
      .filter(m => m.projectId && m.projectName)
      .reduce((acc, message) => {
        if (!acc.find(p => p.Id === message.projectId)) {
          acc.push({
            Id: message.projectId,
            name: message.projectName
          });
        }
        return acc;
      }, []);
    
    return projects.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const chatService = new ChatService();