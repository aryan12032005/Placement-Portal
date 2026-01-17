import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Info, CheckCircle2, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
import { Announcement } from '../types';

export const NotificationDropdown: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await Api.getActiveAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId: string) => {
    if (!user) return;
    try {
      await Api.markAnnouncementRead(announcementId, user.id);
      setAnnouncements(prev => 
        prev.map(a => 
          a.id === announcementId 
            ? { ...a, readBy: [...a.readBy, user.id] }
            : a
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    for (const announcement of announcements) {
      if (!announcement.readBy.includes(user.id)) {
        await markAsRead(announcement.id);
      }
    }
  };

  const unreadCount = user 
    ? announcements.filter(a => !a.readBy.includes(user.id)).length 
    : 0;

  const getTypeIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'urgent': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const getTypeBg = (type: Announcement['type']) => {
    switch (type) {
      case 'success': return isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-100';
      case 'warning': return isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-100';
      case 'urgent': return isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100';
      default: return isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all ${
          isDark 
            ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-96 rounded-xl shadow-2xl border overflow-hidden z-50 ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between ${
            isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'
          }`}>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-indigo-500" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-medium rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                }`}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Announcements List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading...
              </div>
            ) : announcements.length === 0 ? (
              <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {announcements.map((announcement) => {
                  const isRead = user ? announcement.readBy.includes(user.id) : true;
                  return (
                    <div
                      key={announcement.id}
                      onClick={() => !isRead && markAsRead(announcement.id)}
                      className={`p-4 cursor-pointer transition-all hover:bg-opacity-80 ${
                        !isRead 
                          ? getTypeBg(announcement.type)
                          : isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                      } ${!isRead ? 'border-l-4' : ''}`}
                      style={!isRead ? { borderLeftColor: announcement.type === 'urgent' ? '#ef4444' : announcement.type === 'warning' ? '#f59e0b' : announcement.type === 'success' ? '#22c55e' : '#6366f1' } : {}}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isDark ? 'bg-slate-700' : 'bg-slate-100'
                        }`}>
                          {getTypeIcon(announcement.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium text-sm ${
                              isDark ? 'text-white' : 'text-slate-800'
                            } ${!isRead ? 'font-semibold' : ''}`}>
                              {announcement.title}
                            </h4>
                            {!isRead && (
                              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 line-clamp-2 ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {announcement.message}
                          </p>
                          <div className={`flex items-center gap-2 mt-2 text-xs ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            <Clock size={12} />
                            {formatTime(announcement.createdAt)}
                            <span>•</span>
                            <span>{announcement.createdBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {announcements.length > 0 && (
            <div className={`px-4 py-3 border-t ${
              isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'
            }`}>
              <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Showing {announcements.length} notification{announcements.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
