// src/hooks/useNotifications.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import notificationService from '../services/notificationService';

const mapNotification = (item) => {
  const id = item.notificationId || item.id;
  const created = item.createdDate || item.createdAt;
  const isUnread = item.isRead === false || item.unread === true;

  let timeLabel = '';
  if (created) {
    const date = new Date(created);
    timeLabel = date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return {
    raw: item,
    id,
    title: item.subject || item.title || 'Notification',
    message: item.message || '',
    time: timeLabel || 'Just now',
    unread: isUnread,
    createdAt: created,
  };
};

export default function useNotifications({ enabled = true, pollIntervalMs = 120000 } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasToken = useMemo(() => Boolean(localStorage.getItem('token')), []);

  const fetchUnreadCount = useCallback(async () => {
    if (!enabled || !hasToken) return;
    try {
      const res = await notificationService.getUnreadCount();
      const count = res?.data?.unreadCount ?? res?.unreadCount ?? 0;
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  }, [enabled, hasToken]);

  const fetchNotifications = useCallback(
    async (fetchUnread = false) => {
      if (!enabled || !hasToken) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await notificationService.getNotifications(1, 15, { isRead: false });
        const items = res?.data?.items || res?.items || res?.data || [];
        const mapped = items.map(mapNotification);
        setNotifications(mapped);
        if (fetchUnread) {
          const count = res?.data?.totalCount ?? mapped.filter((x) => x.unread).length;
          setUnreadCount(count);
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
        setError(err?.message || 'Unable to load notifications');
      } finally {
        setLoading(false);
      }
    },
    [enabled, hasToken],
  );

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  }, []);

  const dismissNotification = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to dismiss notification', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  }, []);

  // Initial load + polling for unread count
  useEffect(() => {
    if (!enabled || !hasToken) return;
    fetchNotifications(true);
    const intervalId = setInterval(fetchUnreadCount, pollIntervalMs);
    return () => clearInterval(intervalId);
  }, [enabled, hasToken, fetchNotifications, fetchUnreadCount, pollIntervalMs]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    dismissNotification,
    markAllAsRead,
  };
}
