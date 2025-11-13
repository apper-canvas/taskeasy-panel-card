import React, { useEffect, useState } from 'react';
import { chatService } from '@/services/api/chatService';
import { projectService } from '@/services/api/projectService';
import { teamService } from '@/services/api/teamService';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import { cn } from '@/utils/cn';

const Chats = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Form state
  const [newMessage, setNewMessage] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSender, setSelectedSender] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  // Load initial data
  useEffect(() => {
    loadChatData();
  }, []);

  // Filter messages when filter changes
  useEffect(() => {
    filterMessages();
  }, [messages, projectFilter]);

  // Auto-refresh messages every 30 seconds for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadChatData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [messagesData, projectsData, teamData] = await Promise.all([
        chatService.getAll(),
        projectService.getAll(),
        teamService.getAll()
      ]);

      setMessages(messagesData);
      setProjects(projectsData);
      setTeamMembers(teamData);

      // Set default sender to first team member if not selected

    } catch (err) {
      setError(err.message);
      toast.error('Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await chatService.getAll();
      setMessages(messagesData);
    } catch (err) {
      console.error('Failed to refresh messages:', err);
    }
  };

  const filterMessages = () => {
    if (projectFilter === 'all') {
      setFilteredMessages(messages);
    } else if (projectFilter === 'general') {
      setFilteredMessages(messages.filter(m => !m.projectId));
    } else {
      setFilteredMessages(messages.filter(m => m.projectId === parseInt(projectFilter)));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    if (!selectedSender) {
      toast.error('Please select a sender');
      return;
    }

    try {
      setSendingMessage(true);
      
      const sender = teamMembers.find(member => member.Id === parseInt(selectedSender));
      const project = selectedProject ? projects.find(p => p.Id === parseInt(selectedProject)) : null;
      
      const messageData = {
        senderId: parseInt(selectedSender),
        senderName: sender?.name || 'Unknown User',
        senderRole: sender?.role || 'Team Member',
        content: newMessage.trim(),
        projectId: selectedProject ? parseInt(selectedProject) : null,
        projectName: project?.name || null
      };

      await chatService.create(messageData);
      
      // Refresh messages to show new message
      await loadMessages();
      
      // Clear form
      setNewMessage('');
      setSelectedProject('');
      
      toast.success('Message sent successfully');
      
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await chatService.delete(messageId);
      await loadMessages();
      toast.success('Message deleted successfully');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'team leader':
        return 'text-primary-600 bg-primary-50';
      case 'project manager':
        return 'text-purple-600 bg-purple-50';
      case 'designer':
        return 'text-pink-600 bg-pink-50';
      case 'developer':
        return 'text-green-600 bg-green-50';
      case 'qa tester':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-secondary-600 bg-secondary-50';
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadChatData} />;

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-800">Team Chats</h1>
              <p className="text-secondary-600 mt-1">
                Communicate with your team about projects and tasks
              </p>
            </div>
            
            {/* Project Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-secondary-700">Filter by:</span>
              <Select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="min-w-[140px]"
              >
                <option value="all">All Messages</option>
                <option value="general">General Chat</option>
                {projects.map(project => (
                  <option key={project.Id} value={project.Id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card border border-secondary-100">
              <div className="p-4 border-b border-secondary-100">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-secondary-800">
                    {projectFilter === 'all' && 'All Messages'}
                    {projectFilter === 'general' && 'General Chat'}
                    {projectFilter !== 'all' && projectFilter !== 'general' && 
                      projects.find(p => p.Id === parseInt(projectFilter))?.name
                    }
                  </h2>
                  <div className="flex items-center text-sm text-secondary-500">
                    <ApperIcon name="MessageCircle" size={16} className="mr-2" />
                    {filteredMessages.length} messages
                  </div>
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="p-8">
                    <Empty
                      title="No messages yet"
                      description={
                        projectFilter === 'general'
                          ? "Start a general conversation with your team"
                          : projectFilter !== 'all'
                          ? "No messages in this project yet"
                          : "No messages in the chat yet"
                      }
                      action={
                        <Button 
                          onClick={() => document.getElementById('message-input')?.focus()}
                          className="mt-4"
                        >
                          <ApperIcon name="MessageCircle" size={16} className="mr-2" />
                          Send First Message
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-secondary-100">
                    {filteredMessages.map((message) => (
                      <div key={message.Id} className="p-4 hover:bg-secondary-25 transition-colors group">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
<div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {message.senderName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                            </div>
                          </div>
                          
                          {/* Message Content */}
                          <div className="flex-1 min-w-0">
<div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-secondary-800 text-sm">
                                {message.senderName || 'Unknown User'}
                              </span>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                getRoleColor(message.senderRole || 'Team Member')
                              )}>
                                {message.senderRole || 'Team Member'}
                              </span>
                              {message.projectName && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                  {message.projectName}
                                </span>
                              )}
                              <span className="text-xs text-secondary-400 ml-auto">
                                {formatTimestamp(message.timestamp)}
                              </span>
                            </div>
                            
<p className="text-secondary-700 text-sm leading-relaxed">
                              {message.content || 'No message content'}
                            </p>
                          </div>
                          {/* Delete Button */}
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(message.Id)}
                              className="text-error-500 hover:text-error-600 hover:bg-error-50"
                            >
                              <ApperIcon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Send Message Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
              <h3 className="font-semibold text-secondary-800 mb-4 flex items-center">
                <ApperIcon name="Send" size={16} className="mr-2" />
                Send Message
              </h3>

              <form onSubmit={handleSendMessage} className="space-y-4">
                {/* Sender Selection */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Send as
                  </label>
                  <Select
                    value={selectedSender}
                    onChange={(e) => setSelectedSender(e.target.value)}
                    required
                  >
                    <option value="">Select team member...</option>
                    {teamMembers.map(member => (
                      <option key={member.Id} value={member.Id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Project (optional)
                  </label>
                  <Select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    <option value="">General chat</option>
                    {projects.map(project => (
                      <option key={project.Id} value={project.Id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm"
                    required
                    disabled={sendingMessage}
                  />
                </div>

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim() || !selectedSender}
                  className="w-full"
                >
                  {sendingMessage ? (
                    <>
                      <ApperIcon name="Loader" size={16} className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Send" size={16} className="mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-secondary-100">
                <h4 className="font-medium text-secondary-800 mb-3">Chat Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Total Messages:</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Active Projects:</span>
                    <span className="font-medium">
                      {new Set(messages.filter(m => m.projectId).map(m => m.projectId)).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Team Members:</span>
                    <span className="font-medium">
                      {new Set(messages.map(m => m.senderId)).size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;