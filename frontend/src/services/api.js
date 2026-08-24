/**
 * FitZone Centralized API Service
 * Handles all REST API communications with the Express backend
 */

const API_BASE = '/api/v1';

/**
 * Helper to build auth headers with Bearer token
 */
const getAuthHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Handle API responses and standardize errors
 */
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg =
      (data.errors && data.errors.join(', ')) ||
      data.message ||
      `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  /**
   * POST /api/v1/auth/login
   */
  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  /**
   * POST /api/v1/auth/register (New User Sign Up)
   */
  async register(userData) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  /**
   * GET /api/v1/trainers (Public)
   */
  async getTrainers() {
    const response = await fetch(`${API_BASE}/trainers`);
    return handleResponse(response);
  },

  /**
   * POST /api/v1/bookings (Protected)
   */
  async createBooking(bookingData, token) {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(bookingData),
    });
    return handleResponse(response);
  },

  /**
   * GET /api/v1/bookings/my (Protected)
   */
  async getMyBookings(token) {
    const response = await fetch(`${API_BASE}/bookings/my`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * GET /api/v1/bookings (Protected - Admin)
   */
  async getAllBookings(token) {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * PATCH /api/v1/bookings/:id/status (Protected)
   */
  async updateBookingStatus(id, status, token) {
    const response = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  /**
   * PATCH /api/v1/trainers/:id/availability (Admin)
   */
  async toggleTrainerAvailability(id, available, token) {
    const response = await fetch(`${API_BASE}/trainers/${id}/availability`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ available }),
    });
    return handleResponse(response);
  },
};

export default api;
