import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  MessageCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Send,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ChevronRight,
  Filter,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Api } from '../../services/api';
import { Announcement, SupportTicket, UserRole } from '../../types';
import { ConfirmDialog, useConfirmDialog } from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

export const ManageNotifications: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { confirm, dialogProps } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<'announcements' | 'support'>('announcements');
  
  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'info' as Announcement['type']
  });

  // Support tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketFilter, setTicketFilter] = useState<SupportTicket['status'] | 'all'>('all');
  const [newReply, setNewReply] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAnnouncements();
    fetchTickets();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const fetchAnnouncements = async () => {
    try {
      const data = await Api.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const data = await Api.getSupportTickets();
      setTickets(data);
    } catch (error) {
      toast.error('Failed to fetch support tickets');
    } finally {
      setTicketsLoading(false);
    }
  };

  // Announcement handlers
  const handleSaveAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      if (editingAnnouncement) {
        const updated = await Api.updateAnnouncement(editingAnnouncement.id, announcementForm);
        setAnnouncements(prev => prev.map(a => a.id === updated.id ? updated : a));
        toast.success('Announcement updated!');
      } else {
        const created = await Api.postAnnouncement({
          ...announcementForm,
          createdBy: user?.name || 'Admin'
        });
        setAnnouncements(prev => [created, ...prev]);
        toast.success('Announcement posted!');
      }
      closeAnnouncementModal();
    } catch (error) {
      toast.error('Failed to save announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Announcement',
      message: 'Are you sure you want to delete this announcement? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await Api.deleteAnnouncement(id);
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        toast.success('Announcement deleted!');
      } catch (error) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const updated = await Api.updateAnnouncement(announcement.id, { isActive: !announcement.isActive });
      setAnnouncements(prev => prev.map(a => a.id === updated.id ? updated : a));
      toast.success(`Announcement ${updated.isActive ? 'activated' : 'deactivated'}!`);
    } catch (error) {
      toast.error('Failed to update announcement');
    }
  };

  const openAnnouncementModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementForm({
        title: announcement.title,
        message: announcement.message,
        type: announcement.type
      });
    } else {
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: '', message: '', type: 'info' });
    }
    setShowAnnouncementModal(true);
  };

  const closeAnnouncementModal = () => {
    setShowAnnouncementModal(false);
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: '', message: '', type: 'info' });
  };

  // Support ticket handlers
  const handleSendReply = async () => {
    if (!user || !selectedTicket || !newReply.trim()) return;

    setSending(true);
    try {
      const updated = await Api.addMessageToTicket(selectedTicket.id, {
        senderId: user.id,
        senderName: user.name,
        senderRole: UserRole.ADMIN,
        message: newReply.trim()
      });
      setSelectedTicket(updated);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      setNewReply('');
      toast.success('Reply sent!');
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      const updated = await Api.updateTicketStatus(ticketId, status);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated);
      }
      toast.success(`Ticket marked as ${status}!`);
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Ticket',
      message: 'Are you sure you want to delete this support ticket? All messages will be lost.',
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await Api.deleteTicket(id);
        setTickets(prev => prev.filter(t => t.id !== id));
        if (selectedTicket?.id === id) {
          setSelectedTicket(null);
        }
        toast.success('Ticket deleted!');
      } catch (error) {
        toast.error('Failed to delete ticket');
      }
    }
  };

  // Helpers
  const getTypeIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={18} className="text-yellow-500" />;
      case 'urgent': return <AlertCircle size={18} className="text-red-500" />;
      default: return <Info size={18} className="text-blue-500" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = ticketFilter === 'all' || t.status === ticketFilter;
    const matchesSearch = searchQuery === '' || 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openTicketCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in-progress').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Notifications & Support
          </h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
            Manage announcements and respond to student queries
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3">
          <div className={`px-4 py-2 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {openTicketCount} Open
              </span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-100'}`}>
            <div className="flex items-center gap-2">
              <Clock size={14} className={isDark ? 'text-yellow-400' : 'text-yellow-600'} />
              <span className={`text-sm font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {inProgressCount} In Progress
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`p-1 rounded-xl inline-flex ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Bell size={18} />
          Announcements
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'announcements' ? 'bg-white/20' : isDark ? 'bg-slate-700' : 'bg-slate-200'
          }`}>
            {announcements.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'support'
              ? 'bg-indigo-600 text-white'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <MessageCircle size={18} />
          Support Tickets
          {openTicketCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
              {openTicketCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'announcements' ? (
        // Announcements Tab
        <div className="space-y-4">
          {/* Add Button */}
          <div className="flex justify-end">
            <button
              onClick={() => openAnnouncementModal()}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              New Announcement
            </button>
          </div>

          {/* Announcements List */}
          {announcementsLoading ? (
            <div className={`p-12 text-center rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <Loader2 size={32} className="animate-spin mx-auto mb-2 text-indigo-500" />
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className={`p-12 text-center rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <Bell size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No announcements yet</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Create your first announcement to notify students</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'
                  } ${!announcement.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      announcement.type === 'urgent' ? isDark ? 'bg-red-500/10' : 'bg-red-50' :
                      announcement.type === 'warning' ? isDark ? 'bg-yellow-500/10' : 'bg-yellow-50' :
                      announcement.type === 'success' ? isDark ? 'bg-green-500/10' : 'bg-green-50' :
                      isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                    }`}>
                      {getTypeIcon(announcement.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {announcement.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          announcement.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {announcement.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {announcement.message}
                      </p>
                      <div className={`flex items-center gap-4 mt-3 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(announcement.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {announcement.createdBy}
                        </span>
                        <span>
                          {announcement.readBy.length} read
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(announcement)}
                        className={`p-2 rounded-lg transition-all ${
                          isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                        }`}
                        title={announcement.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {announcement.isActive ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <X size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                        )}
                      </button>
                      <button
                        onClick={() => openAnnouncementModal(announcement)}
                        className={`p-2 rounded-lg transition-all ${
                          isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className={`p-2 rounded-lg transition-all ${
                          isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Support Tickets Tab
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className={`lg:col-span-1 rounded-xl border overflow-hidden ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            {/* Search & Filter */}
            <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="relative mb-3">
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border-slate-300 placeholder-slate-400'
                  } focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {(['all', 'open', 'in-progress', 'resolved', 'closed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setTicketFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      ticketFilter === status
                        ? 'bg-indigo-600 text-white'
                        : isDark ? 'bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets */}
            <div className="max-h-[500px] overflow-y-auto">
              {ticketsLoading ? (
                <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedTicket?.id === ticket.id
                          ? isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'
                          : isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`}></span>
                            <h4 className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {ticket.subject}
                            </h4>
                          </div>
                          <p className={`text-sm mt-1 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {ticket.studentName}
                          </p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''} • {formatDate(ticket.updatedAt)}
                          </p>
                        </div>
                        <ChevronRight size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className={`lg:col-span-2 rounded-xl border overflow-hidden flex flex-col ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            {selectedTicket ? (
              <>
                {/* Ticket Header */}
                <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {selectedTicket.subject}
                      </h3>
                      <div className={`flex items-center gap-3 mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {selectedTicket.studentName}
                        </span>
                        <span>{selectedTicket.studentEmail}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getStatusColor(selectedTicket.status)}`}>
                          {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value as SupportTicket['status'])}
                        className={`px-3 py-2 rounded-lg border text-sm ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTicket(selectedTicket.id)}
                        className={`p-2 rounded-lg transition-all ${
                          isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px]">
                  {selectedTicket.messages.map((msg) => {
                    const isAdmin = msg.senderRole === UserRole.ADMIN;
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${isAdmin ? 'order-2' : ''}`}>
                          <div className={`px-4 py-3 rounded-2xl ${
                            isAdmin 
                              ? 'bg-indigo-600 text-white rounded-br-md' 
                              : isDark 
                                ? 'bg-slate-700 text-white rounded-bl-md' 
                                : 'bg-slate-100 text-slate-800 rounded-bl-md'
                          }`}>
                            <div className={`text-xs mb-1 ${isAdmin ? 'text-indigo-200' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {msg.senderName} {isAdmin && '(Admin)'}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <div className={`text-xs mt-1 ${isAdmin ? 'text-right' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                {selectedTicket.status !== 'closed' && (
                  <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                        placeholder="Type your reply..."
                        className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-white border-slate-300 placeholder-slate-400'
                        } focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={sending || !newReply.trim()}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Select a ticket to view</p>
                  <p className="text-sm mt-1">Choose a ticket from the list to respond</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAnnouncementModal} />
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Announcement title"
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border-slate-300 placeholder-slate-400'
                  } focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Type
                </label>
                <select
                  value={announcementForm.type}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, type: e.target.value as Announcement['type'] }))}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-slate-300 text-slate-700'
                  } focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                >
                  <option value="info">Info (Blue)</option>
                  <option value="success">Success (Green)</option>
                  <option value="warning">Warning (Yellow)</option>
                  <option value="urgent">Urgent (Red)</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Message
                </label>
                <textarea
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Announcement message..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border transition-all resize-none ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border-slate-300 placeholder-slate-400'
                  } focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                />
              </div>
            </div>
            <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} flex justify-end gap-3`}>
              <button
                onClick={closeAnnouncementModal}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  isDark 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAnnouncement}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
              >
                {editingAnnouncement ? 'Save Changes' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
};
