import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Plus, 
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Headphones
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
import { SupportTicket, UserRole } from '../types';
import toast from 'react-hot-toast';

export const SupportChat: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general' as SupportTicket['category'],
    message: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchTickets();
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const data = await Api.getStudentTickets(user.id);
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!user || !newTicket.subject || !newTicket.message) {
      toast.error('Please fill all fields');
      return;
    }

    setSending(true);
    try {
      const ticket = await Api.createSupportTicket({
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        subject: newTicket.subject,
        category: newTicket.category,
        messages: [{
          id: `msg${Date.now()}`,
          ticketId: '',
          senderId: user.id,
          senderName: user.name,
          senderRole: UserRole.STUDENT,
          message: newTicket.message,
          createdAt: new Date().toISOString()
        }]
      });
      setTickets(prev => [ticket, ...prev]);
      setSelectedTicket(ticket);
      setShowNewTicketForm(false);
      setNewTicket({ subject: '', category: 'general', message: '' });
      toast.success('Support ticket created successfully!');
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedTicket || !newMessage.trim()) return;

    setSending(true);
    try {
      const updatedTicket = await Api.addMessageToTicket(selectedTicket.id, {
        senderId: user.id,
        senderName: user.name,
        senderRole: UserRole.STUDENT,
        message: newMessage.trim()
      });
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
    }
  };

  const getCategoryLabel = (category: SupportTicket['category']) => {
    switch (category) {
      case 'general': return 'General';
      case 'technical': return 'Technical';
      case 'internship': return 'Internship';
      case 'account': return 'Account';
      case 'feedback': return 'Feedback';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const unreadCount = tickets.filter(t => 
    t.status !== 'closed' && 
    t.messages.length > 0 && 
    t.messages[t.messages.length - 1].senderRole === UserRole.ADMIN
  ).length;

  return (
    <>
      {/* Support Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative p-2 rounded-lg transition-all ${
          isDark 
            ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        <MessageCircle size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Support Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className={`relative w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-600' : 'border-slate-200 bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}>
              <div className="flex items-center gap-3">
                {selectedTicket && !showNewTicketForm && (
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-1 rounded-lg hover:bg-white/20 text-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <Headphones className="text-white" size={24} />
                <div>
                  <h2 className="font-bold text-white text-lg">
                    {showNewTicketForm ? 'New Support Request' : selectedTicket ? selectedTicket.subject : 'Support Center'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {showNewTicketForm ? 'We\'re here to help!' : selectedTicket ? getCategoryLabel(selectedTicket.category) : 'Get help from our team'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/20 text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {showNewTicketForm ? (
                // New Ticket Form
                <div className="p-6 space-y-4 overflow-y-auto h-full">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Category
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as SupportTicket['category'] }))}
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20`}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="internship">Internship Related</option>
                      <option value="account">Account Issue</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Message
                    </label>
                    <textarea
                      value={newTicket.message}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe your issue in detail..."
                      rows={6}
                      className={`w-full px-4 py-3 rounded-xl border transition-all resize-none ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20`}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowNewTicketForm(false)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        isDark 
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateTicket}
                      disabled={sending || !newTicket.subject || !newTicket.message}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      Submit Request
                    </button>
                  </div>
                </div>
              ) : selectedTicket ? (
                // Chat View
                <div className="flex flex-col h-full">
                  {/* Status Bar */}
                  <div className={`px-4 py-2 flex items-center gap-2 text-sm ${
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  }`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      Created {formatDate(selectedTicket.createdAt)}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedTicket.messages.map((msg, idx) => {
                      const isStudent = msg.senderRole === UserRole.STUDENT;
                      const showDate = idx === 0 || 
                        formatDate(msg.createdAt) !== formatDate(selectedTicket.messages[idx - 1].createdAt);

                      return (
                        <React.Fragment key={msg.id}>
                          {showDate && (
                            <div className="text-center">
                              <span className={`text-xs px-3 py-1 rounded-full ${
                                isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {formatDate(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] ${isStudent ? 'order-2' : ''}`}>
                              <div className={`px-4 py-3 rounded-2xl ${
                                isStudent 
                                  ? 'bg-indigo-600 text-white rounded-br-md' 
                                  : isDark 
                                    ? 'bg-slate-700 text-white rounded-bl-md' 
                                    : 'bg-slate-100 text-slate-800 rounded-bl-md'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 text-xs ${
                                isStudent ? 'justify-end' : ''
                              } ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <Clock size={10} />
                                {formatTime(msg.createdAt)}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  {selectedTicket.status !== 'closed' && (
                    <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                          placeholder="Type your message..."
                          className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' 
                              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                          } focus:ring-2 focus:ring-indigo-500/20`}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={sending || !newMessage.trim()}
                          className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Tickets List
                <div className="h-full flex flex-col">
                  {/* New Ticket Button */}
                  <div className="p-4">
                    <button
                      onClick={() => setShowNewTicketForm(true)}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      New Support Request
                    </button>
                  </div>

                  {/* Tickets */}
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Loader2 size={32} className="animate-spin mx-auto mb-2" />
                        Loading tickets...
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No support requests yet</p>
                        <p className="text-sm mt-1">Create a new request if you need help</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {tickets.map((ticket) => {
                          const lastMessage = ticket.messages[ticket.messages.length - 1];
                          const hasAdminReply = lastMessage && lastMessage.senderRole === UserRole.ADMIN;

                          return (
                            <div
                              key={ticket.id}
                              onClick={() => setSelectedTicket(ticket)}
                              className={`p-4 cursor-pointer transition-all ${
                                isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                      {ticket.subject}
                                    </h4>
                                    {hasAdminReply && (
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    )}
                                  </div>
                                  <p className={`text-sm mt-1 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {lastMessage?.message || 'No messages'}
                                  </p>
                                  <div className={`flex items-center gap-2 mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <span className={`px-2 py-0.5 rounded-full text-white ${getStatusColor(ticket.status)}`}>
                                      {getStatusLabel(ticket.status)}
                                    </span>
                                    <span>•</span>
                                    <span>{formatDate(ticket.updatedAt)}</span>
                                  </div>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-xs ${
                                  isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {ticket.messages.length} msg{ticket.messages.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
