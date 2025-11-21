// src/services/chatService.js
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
// If REACT_APP_API_URL ends with /api, remove it for hub root
const HUB_BASE = API_BASE.endsWith('/api')
  ? API_BASE.replace(/\/api$/, '')
  : API_BASE || 'http://localhost:7077';

export const CHAT_HUB_URL = `${HUB_BASE}/hubs/chat`;

// Always pull the latest token from storage to avoid "token expired" during reconnect.
const getJwtToken = () =>
  localStorage.getItem('accessToken') ||
  localStorage.getItem('token') ||
  '';

export const createChatConnection = () =>
  new HubConnectionBuilder()
    .withUrl(CHAT_HUB_URL, {
      accessTokenFactory: () => getJwtToken(),
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(LogLevel.Information)
    .build();

export const startConnection = async (connection) => {
  if (!connection) return;
  // Avoid duplicate starts
  if (connection.state === 'Connected') return;
  try {
    await connection.start();
    console.log('SignalR connected to chat hub');
  } catch (err) {
    console.error('SignalR connection error:', err);
    // Normalize common errors for UI
    if (err?.message?.includes('401')) {
      throw new Error('Chat auth failed (401). Please login again.');
    }
    if (err?.message?.includes('negotiate')) {
      throw new Error('Negotiation failed. Please refresh token and retry.');
    }
    throw err;
  }
};
