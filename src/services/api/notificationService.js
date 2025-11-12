import notificationsData from "@/services/mockData/notifications.json";

class NotificationService {
  constructor() {
    this.notifications = [...notificationsData];
  }

  async getAll() {
    await this.delay(200);
    return [...this.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getUnread() {
    await this.delay(150);
    return this.notifications
      .filter(n => !n.read)
      .map(n => ({ ...n }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async markAsRead(id) {
    await this.delay(100);
    
    const index = this.notifications.findIndex(n => n.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Notification with id ${id} not found`);
    }
    
    this.notifications[index].read = true;
    return { ...this.notifications[index] };
  }

  async markAllAsRead() {
    await this.delay(200);
    
    this.notifications = this.notifications.map(n => ({
      ...n,
      read: true
    }));
    
    return this.notifications.length;
  }

  async create(notificationData) {
    await this.delay(150);
    
    const newNotification = {
      id: Math.max(...this.notifications.map(n => n.id), 0) + 1,
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    this.notifications.push(newNotification);
    return { ...newNotification };
  }

  async delete(id) {
    await this.delay(100);
    
    const index = this.notifications.findIndex(n => n.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Notification with id ${id} not found`);
    }
    
    const deletedNotification = this.notifications.splice(index, 1)[0];
    return { ...deletedNotification };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const notificationService = new NotificationService();