import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { chatService } from "@/services/api/chatService";
import { projectService } from "@/services/api/projectService";
import { teamService } from "@/services/api/teamService";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import Team from "@/components/pages/Team";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
const Chats = () => {
const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
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

  useEffect(() => {
    loadConversations();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages();
    }
  }, [selectedConversation]);

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

  const loadConversations = async () => {
    try {
      const conversationsData = await chatService.getConversations();
      setConversations(conversationsData);
      // Auto-select first conversation if none selected
      if (!selectedConversation && conversationsData.length > 0) {
        setSelectedConversation(conversationsData[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadConversationMessages = async () => {
    if (!selectedConversation) return;
    try {
      const messages = await chatService.getConversationMessages(selectedConversation.id);
      setConversationMessages(messages);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-800">Team Chats</h1>
              <p className="text-secondary-600 mt-1">
                Click on conversations to chat with your team and view history
              </p>
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card border border-secondary-100 h-full flex flex-col">
              <div className="p-4 border-b border-secondary-100">
                <h3 className="font-semibold text-secondary-800 flex items-center">
                  <ApperIcon name="MessageSquare" size={16} className="mr-2" />
                  Conversations
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4">
                    <Loading type="spinner" className="w-6 h-6" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-secondary-500">
                    No conversations yet
                  </div>
                ) : (
                  <div className="divide-y divide-secondary-100">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-secondary-25 ${
                          selectedConversation?.id === conversation.id ? 'bg-primary-50 border-r-2 border-r-primary-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <ApperIcon 
                                name={conversation.type === 'project' ? 'Folder' : 'Users'} 
                                size={14} 
                                className="text-secondary-500 flex-shrink-0" 
                              />
                              <h4 className="font-medium text-secondary-800 text-sm truncate">
                                {conversation.type === 'project' ? conversation.projectName : 'General Chat'}
                              </h4>
                            </div>
                            <p className="text-xs text-secondary-600 truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-secondary-500">
                              <span>{conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}</span>
                              <span>•</span>
                              <span>{conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          {conversation.lastMessage && (
                            <span className="text-xs text-secondary-500 ml-2 flex-shrink-0">
                              {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white rounded-xl shadow-card border border-secondary-100 h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-secondary-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ApperIcon 
                        name={selectedConversation.type === 'project' ? 'Folder' : 'Users'} 
                        size={18} 
                        className="text-secondary-600" 
                      />
                      <div>
                        <h3 className="font-semibold text-secondary-800">
                          {selectedConversation.type === 'project' ? selectedConversation.projectName : 'General Chat'}
                        </h3>
                        <p className="text-sm text-secondary-600">
                          {selectedConversation.participants.join(', ')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {selectedConversation.messageCount} messages
                    </Badge>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversationMessages.length === 0 ? (
                    <div className="text-center text-secondary-500 py-8">
                      <ApperIcon name="MessageSquare" size={48} className="mx-auto mb-3 text-secondary-300" />
                      <p>No messages in this conversation yet</p>
                      <p className="text-sm">Start the conversation below!</p>
                    </div>
                  ) : (
                    conversationMessages.map((message) => (
                      <div key={message.Id} className="flex gap-3">
                        <Avatar 
                          name={message.senderName || 'Unknown'} 
                          size="sm" 
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-secondary-800 text-sm">
                              {message.senderName || 'Unknown User'}
                            </span>
                            <span className="text-xs text-secondary-500">
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {message.senderRole || 'Team Member'}
                            </Badge>
                          </div>
                          <div className="bg-secondary-50 rounded-lg p-3">
                            <p className="text-secondary-700 text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.Id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-secondary-100">
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <div className="flex gap-3">
                      <Select
                        value={selectedSender}
                        onChange={(e) => setSelectedSender(e.target.value)}
                        required
                        className="w-40 flex-shrink-0"
                      >
                        <option value="">Send as...</option>
                        {teamMembers.map(member => (
                          <option key={member.Id} value={member.Id}>
                            {member.name}
                          </option>
                        ))}
                      </Select>
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          required
                          className="flex-1"
                        />
                        <Button 
                          type="submit" 
                          disabled={sendingMessage || !selectedSender.trim() || !newMessage.trim()}
                          className="flex-shrink-0"
                        >
                          {sendingMessage ? (
                            <ApperIcon name="Loader2" size={16} className="animate-spin" />
                          ) : (
                            <ApperIcon name="Send" size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-card border border-secondary-100 h-full flex items-center justify-center">
                <div className="text-center text-secondary-500">
                  <ApperIcon name="MessageSquare" size={64} className="mx-auto mb-4 text-secondary-300" />
                  <h3 className="font-medium text-secondary-700 mb-2">Select a Conversation</h3>
                  <p>Click on a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legacy Message Form - Hidden when conversation selected */}
        {!selectedConversation && (

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
<div className="mt-6">
            <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
              <h3 className="font-semibold text-secondary-800 mb-4 flex items-center">
                <ApperIcon name="Send" size={16} className="mr-2" />
                Send New Message
              </h3>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>

                {/* Send Button */}
                <Button 
                  type="submit" 
                  disabled={sendingMessage || !selectedSender.trim() || !newMessage.trim()}
                  className="w-full"
                >
                  {sendingMessage ? (
                    <>
                      <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
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
            </div>
          </div>
        </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
            <h3 className="font-semibold text-secondary-800 mb-4 flex items-center">
              <ApperIcon name="BarChart3" size={16} className="mr-2" />
              Chat Activity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {conversations.length}
                </div>
                <div className="text-sm text-secondary-600">Active Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600 mb-1">
                  {messages.length}
                </div>
                <div className="text-sm text-secondary-600">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600 mb-1">
                  {teamMembers.length}
                </div>
                <div className="text-sm text-secondary-600">Team Members</div>
              </div>
            </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default Chats;