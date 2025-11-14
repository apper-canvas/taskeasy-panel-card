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
    
    // Validate required fields
    if (!messageData || !messageData.content || !messageData.content.trim()) {
      throw new Error('Message content is required');
    }
    
    if (!messageData.senderId || !messageData.senderName) {
      throw new Error('Sender information is required');
    }
    
    const newMessage = {
      Id: Math.max(0, ...this.messages.map(m => m.Id)) + 1,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderRole: messageData.senderRole || 'Team Member',
      content: messageData.content.trim(),
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

  // Get conversations grouped by context (project or general)
  async getConversations() {
    await this.delay(150);
    const conversations = [];
    
    // Group messages by project or general chat
    const grouped = this.messages.reduce((acc, message) => {
      const key = message.projectId ? `project-${message.projectId}` : 'general';
      if (!acc[key]) {
        acc[key] = {
          id: key,
          type: message.projectId ? 'project' : 'general',
          projectId: message.projectId,
          projectName: message.projectName,
          messages: [],
          lastMessage: null,
          participants: new Set()
        };
      }
      acc[key].messages.push(message);
      acc[key].participants.add(message.senderName);
      return acc;
    }, {});

    // Convert to array and add metadata
    Object.values(grouped).forEach(conv => {
      conv.lastMessage = conv.messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      conv.participants = Array.from(conv.participants);
      conv.messageCount = conv.messages.length;
      conversations.push(conv);
    });

    return conversations.sort((a, b) => new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0));
  }

  // Get messages for specific conversation
  async getConversationMessages(conversationId) {
    await this.delay(100);
    const isGeneral = conversationId === 'general';
    const projectId = isGeneral ? null : parseInt(conversationId.replace('project-', ''));
    
    return this.messages
      .filter(m => isGeneral ? !m.projectId : m.projectId === projectId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
}

export const chatService = new ChatService();