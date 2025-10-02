/**
 * Chat API Service - Real-time Messaging Integration
 * 
 * This service provides comprehensive chat functionality for the Casaway web application,
 * including direct messaging, group chats, message management, and user interactions.
 * 
 * Key Features:
 * - Direct messaging between users
 * - Group chat creation and management
 * - Message sending, editing, and deletion
 * - User management in group chats
 * - Admin role management
 * - Authentication header management
 * - Error handling and validation
 * 
 * @author Casaway Development Team
 * @version 1.0.0
 */

'use client';

/**
 * API Base URL Configuration
 * 
 * Configure the backend API URL for chat-related requests.
 * Falls back to localhost for development.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Authentication Headers Helper
 * 
 * Generates authentication headers for API requests by retrieving
 * JWT tokens from localStorage or sessionStorage.
 * 
 * @returns Promise resolving to headers object with authentication
 */
async function getAuthHeaders() {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('token') || sessionStorage.getItem('token'))
    : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;
}

/**
 * Chat API Service Object
 * 
 * Comprehensive chat functionality including:
 * - Chat management (create, join, leave)
 * - Message operations (send, edit, delete)
 * - Group management (members, admins)
 * - User interactions and permissions
 */
export const chatApi = {
  async getUserChats() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/chat/user`, { headers });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to fetch chats');
    return res.json();
  },

  async createGroupChat(groupName: string, memberIds: string[], groupDescription?: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/chat/group`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ groupName, memberIds, ...(groupDescription ? { groupDescription } : {}) })
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to create group');
    return res.json();
  },

  async getAllUsers() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/users`, { headers });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to fetch users');
    return res.json();
  },

  async addMembersToGroup(chatId: string, memberIds: string[]) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/chat/${chatId}/add-members`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ memberIds })
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to add members');
    return res.json();
  },

  async removeMembersFromGroup(chatId: string, memberIds: string[]) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/chat/${chatId}/remove-members`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ memberIds })
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to remove members');
    return res.json();
  },

  async addAdminToGroup(chatId: string, userId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/chat/${chatId}/add-admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to add admin');
    return res.json();
  },

  async removeAdminFromGroup(chatId: string, userId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/chat/${chatId}/remove-admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to remove admin');
    return res.json();
  },

  async updateGroupInfo(chatId: string, updateData: { groupName?: string; groupDescription?: string; groupImage?: string }) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/chat/${chatId}/group-info`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to update group info');
    return res.json();
  },

  async leaveGroup(chatId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/chat/${chatId}/leave`, {
      method: 'POST',
      headers
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to leave group');
    return res.json();
  },

  async getChatMessages(chatId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/message/${chatId}`, { headers });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to fetch messages');
    return res.json();
  },

  async sendMessage(chatId: string, content: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ chatId, content }),
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to send message');
    return res.json();
  },

  async editMessage(messageId: string, content: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/message/edit/${messageId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to edit message');
    return res.json();
  },

  async deleteForMe(messageId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/message/delete-for-me/${messageId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to delete message');
    return res.json();
  },

  async deleteForEveryone(messageId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/message/delete-for-everyone/${messageId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error((await res.json()).msg || 'Failed to delete message');
    return res.json();
  },
};


