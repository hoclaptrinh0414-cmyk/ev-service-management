// src/services/notificationService.js
import { notificationAPI } from './api';

/**
 * Notification Service
 * Quản lý thông báo cho customer theo Postman collection
 */
export const notificationService = {
  /**
   * Lấy danh sách thông báo
   * GET /api/notifications?Page=1&PageSize=20
   *
   * @param {number} page - Trang hiện tại (mặc định 1)
   * @param {number} pageSize - Số lượng items mỗi trang (mặc định 20)
   * @returns Response với items, total, currentPage, totalPages
   */
  async getNotifications(page = 1, pageSize = 20) {
    try {
      const response = await notificationAPI.getNotifications(page, pageSize);
      console.log('✅ Get notifications success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get notifications failed:', error);
      throw error;
    }
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   * GET /api/notifications/unread-count
   *
   * @returns Response với unreadCount
   */
  async getUnreadCount() {
    try {
      const response = await notificationAPI.getUnreadCount();
      console.log('✅ Get unread count success:', response);
      return response;
    } catch (error) {
      console.error('❌ Get unread count failed:', error);
      throw error;
    }
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   * PUT /api/notifications/read-all
   *
   * @returns Success response
   */
  async markAllAsRead() {
    try {
      const response = await notificationAPI.markAllAsRead();
      console.log('✅ Mark all notifications as read success:', response);
      return response;
    } catch (error) {
      console.error('❌ Mark all notifications as read failed:', error);
      throw error;
    }
  },
};

export default notificationService;
