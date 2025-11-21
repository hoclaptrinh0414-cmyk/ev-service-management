// src/services/notificationService.js
import { notificationAPI } from './api';

const logServiceError = (action, error) => {
  console.error(`NotificationService.${action} failed`, error);
  throw error;
};

const notificationService = {
  async getNotifications(page = 1, pageSize = 20, params = {}) {
    try {
      return await notificationAPI.getNotifications(page, pageSize, params);
    } catch (error) {
      logServiceError('getNotifications', error);
    }
  },

  async getUnreadCount() {
    try {
      return await notificationAPI.getUnreadCount();
    } catch (error) {
      logServiceError('getUnreadCount', error);
    }
  },

  async markAsRead(notificationId) {
    try {
      return await notificationAPI.markAsRead(notificationId);
    } catch (error) {
      logServiceError('markAsRead', error);
    }
  },

  async markAllAsRead() {
    try {
      return await notificationAPI.markAllAsRead();
    } catch (error) {
      logServiceError('markAllAsRead', error);
    }
  },
};

export default notificationService;
