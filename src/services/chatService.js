import api from './api';

/**
 * Chat Service
 * Chat channel and messaging operations
 */

// Create chat channel
export const createChatChannel = async (channelData) => {
    try {
        const response = await api.post('/api/chat/channels', channelData);
        return response.data;
    } catch (error) {
        console.error('Error creating chat channel:', error);
        throw error;
    }
};

// Get all chat channels
export const getChatChannels = async (params = {}) => {
    try {
        const response = await api.get('/api/chat/channels', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching chat channels:', error);
        throw error;
    }
};

// Get chat channel by ID
export const getChatChannelById = async (id) => {
    try {
        const response = await api.get(`/api/chat/channels/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching chat channel ${id}:`, error);
        throw error;
    }
};

// Send message
export const sendMessage = async (messageData) => {
    try {
        const response = await api.post('/api/chat/send', messageData);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// Get chat history
export const getChatHistory = async (params = {}) => {
    try {
        const response = await api.get('/api/chat/history', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
};

// Mark channel as read
export const markChannelAsRead = async (channelId) => {
    try {
        const response = await api.put(`/api/chat/channels/${channelId}/read`);
        return response.data;
    } catch (error) {
        console.error(`Error marking channel ${channelId} as read:`, error);
        throw error;
    }
};

// Close channel
export const closeChannel = async (channelId) => {
    try {
        const response = await api.put(`/api/chat/channels/${channelId}/close`);
        return response.data;
    } catch (error) {
        console.error(`Error closing channel ${channelId}:`, error);
        throw error;
    }
};

const chatService = {
    createChatChannel,
    getChatChannels,
    getChatChannelById,
    sendMessage,
    getChatHistory,
    markChannelAsRead,
    closeChannel,
};

export default chatService;
