// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import appointmentService from '../services/appointmentService';

// Tính khoảng cách ngày giữa 2 ngày
const getDaysUntil = (dateString) => {
  const targetDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// Format thời gian hiển thị
const formatTimeAgo = (days) => {
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Ngày mai';
  if (days === 2) return '2 ngày nữa';
  if (days === 3) return '3 ngày nữa';
  if (days > 3) return `${days} ngày nữa`;
  if (days === -1) return 'Hôm qua';
  if (days < -1) return `${Math.abs(days)} ngày trước`;
  return `${days} ngày`;
};

// Tạo notification từ appointment
const createNotificationFromAppointment = (appointment) => {
  const daysUntil = getDaysUntil(appointment.appointmentDate);

  // Chỉ tạo notification nếu còn từ 0-3 ngày (bao gồm cả hôm nay)
  if (daysUntil < 0 || daysUntil > 3) {
    return null;
  }

  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let message = '';
  if (daysUntil === 0) {
    message = `Lịch bảo dưỡng của bạn là hôm nay (${formattedDate})`;
  } else if (daysUntil === 1) {
    message = `Lịch bảo dưỡng của bạn sẽ diễn ra vào ngày mai (${formattedDate})`;
  } else if (daysUntil === 2) {
    message = `Lịch bảo dưỡng của bạn còn 2 ngày nữa (${formattedDate})`;
  } else if (daysUntil === 3) {
    message = `Lịch bảo dưỡng của bạn còn 3 ngày nữa (${formattedDate})`;
  }

  return {
    id: `appointment-${appointment.appointmentId}`,
    appointmentId: appointment.appointmentId,
    appointmentCode: appointment.appointmentCode,
    type: 'appointment_reminder',
    title: daysUntil === 0 ? 'Lịch bảo dưỡng hôm nay!' : 'Nhắc nhở lịch bảo dưỡng',
    message,
    time: formatTimeAgo(daysUntil),
    createdAt: new Date().toISOString(),
    unread: true,
    priority: daysUntil === 0 ? 'high' : daysUntil === 1 ? 'medium' : 'normal'
  };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load notifications từ localStorage
  const loadNotificationsFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Lọc bỏ các notification cũ (quá 7 ngày)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return parsed.filter(n => {
          const createdAt = new Date(n.createdAt);
          return createdAt > sevenDaysAgo;
        });
      }
      return [];
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
      return [];
    }
  }, []);

  // Lưu notifications vào localStorage
  const saveNotificationsToStorage = useCallback((notifs) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifs));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }, []);

  // Fetch appointments và tạo notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy các appointment sắp tới
      const upcomingAppointments = await appointmentService.getUpcomingAppointments(10);

      // Load notifications hiện tại từ storage
      const storedNotifications = loadNotificationsFromStorage();

      // Tạo map để dễ tra cứu
      const storedNotificationMap = new Map(
        storedNotifications.map(n => [n.id, n])
      );

      // Tạo notifications mới từ appointments
      const newNotifications = [];
      upcomingAppointments.forEach(appointment => {
        const notification = createNotificationFromAppointment(appointment);
        if (notification) {
          // Nếu notification đã tồn tại, giữ nguyên trạng thái unread
          const existing = storedNotificationMap.get(notification.id);
          if (existing) {
            notification.unread = existing.unread;
            notification.createdAt = existing.createdAt; // Giữ nguyên thời gian tạo ban đầu
          }
          newNotifications.push(notification);
        }
      });

      // Thêm các notifications cũ (không phải appointment reminder)
      storedNotifications.forEach(n => {
        if (n.type !== 'appointment_reminder') {
          newNotifications.push(n);
        }
      });

      // Sắp xếp theo priority và thời gian
      newNotifications.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, normal: 2 };
        const priorityA = priorityOrder[a.priority] || 2;
        const priorityB = priorityOrder[b.priority] || 2;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setNotifications(newNotifications);
      saveNotificationsToStorage(newNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      // Nếu có lỗi, load từ storage
      const storedNotifications = loadNotificationsFromStorage();
      setNotifications(storedNotifications);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadNotificationsFromStorage, saveNotificationsToStorage]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === notificationId ? { ...n, unread: false } : n
      );
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, [saveNotificationsToStorage]);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, [saveNotificationsToStorage]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, unread: false }));
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, [saveNotificationsToStorage]);

  // Add custom notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      unread: true,
      createdAt: new Date().toISOString(),
      time: 'Vừa xong',
      ...notification
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, [saveNotificationsToStorage]);

  // Fetch notifications on mount và refresh mỗi 5 phút
  useEffect(() => {
    fetchNotifications();

    // Refresh notifications mỗi 5 phút
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000); // 5 phút

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    dismissNotification,
    markAllAsRead,
    addNotification,
    refresh: fetchNotifications
  };
};

export default useNotifications;
