import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  UserCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import type { AppNotification } from '../types/notification';

export const NotificationsPopover = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // silencia erro de rede
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications?page=1&pageSize=15');
      setNotifications(res.data.items || []);
    } catch {
      // silencia erro de rede
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silencia
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silencia
    }
  };

  const handleNotificationClick = async (n: AppNotification) => {
    if (!n.isRead) {
      await handleMarkAsRead(n.id);
    }
    setIsOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Agora';
      if (diffMins < 60) return `há ${diffMins} min`;
      if (diffHours < 24) return `há ${diffHours}h`;
      if (diffDays === 1) return 'Ontem';
      return `há ${diffDays} dias`;
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MentorshipRequest':
      case 'MentorshipAccepted':
        return <UserCheck size={16} className="text-emerald-500" />;
      case 'MentorshipRevoked':
      case 'MentorshipRejected':
        return <AlertCircle size={16} className="text-rose-500" />;
      case 'GoalCreated':
      case 'GoalSubmitted':
      case 'GoalReviewed':
        return <CheckCircle2 size={16} className="text-amber-500" />;
      case 'MentorshipMessage':
        return <MessageSquare size={16} className="text-sky-500" />;
      case 'ProjectUpdated':
        return <FileText size={16} className="text-indigo-500" />;
      default:
        return <Clock size={16} className="text-[var(--agora-muted)]" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center h-9 w-9 rounded-lg border border-[var(--agora-border)] bg-[var(--agora-panel)] text-[var(--agora-muted)] hover:text-[var(--agora-ink)] hover:border-[var(--agora-accent)] transition-all"
        title="Notificações"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0a5c2f] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--agora-panel)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--agora-border)] bg-[var(--agora-card-bg)]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[var(--agora-ink)]">Notificações</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0a5c2f]/15 text-[#0a5c2f]">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-[var(--agora-muted)] hover:text-[var(--agora-accent)] transition-colors"
                title="Marcar todas como lidas"
              >
                <Check size={14} />
                Lidas
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--agora-border)]">
            {isLoading && notifications.length === 0 && (
              <div className="py-8 text-center text-xs text-[var(--agora-muted)]">
                Carregando notificações...
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="py-10 text-center text-xs text-[var(--agora-muted)] flex flex-col items-center gap-2">
                <Bell size={24} className="opacity-30" />
                <span>Nenhuma notificação recente</span>
              </div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  n.isRead
                    ? 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
                    : 'bg-[#0a5c2f]/5 hover:bg-[#0a5c2f]/10'
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-[var(--agora-card-bg)] border border-[var(--agora-border)] flex-shrink-0">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`text-xs truncate ${!n.isRead ? 'font-bold text-[var(--agora-ink)]' : 'font-medium text-[var(--agora-ink)]'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-[var(--agora-muted)] flex-shrink-0">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--agora-muted)] line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-[#0a5c2f] flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
