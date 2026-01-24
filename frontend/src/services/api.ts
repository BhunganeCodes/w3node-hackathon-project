import axios from 'axios';

/**
 * Base API URL
 * Falls back to localhost for development
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Axios instance
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API Service
 */
export const apiService = {
  /**
   * Health check – used by Header + App init
   */
  async healthCheck(): Promise<boolean> {
    try {
      const res = await apiClient.get('/health');
      return res.status === 200;
    } catch (error) {
      console.warn('⚠️ Backend health check failed (demo mode)');
      throw error;
    }
  },

  /**
   * Submit tender metadata to backend (optional usage)
   */
  async submitTender(data: {
    title: string;
    description: string;
    documentHash: string;
  }) {
    try {
      const res = await apiClient.post('/tenders', data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to submit tender:', error);
      throw error;
    }
  },

  /**
   * Fetch all tenders
   */
  async getTenders() {
    try {
      const res = await apiClient.get('/tenders');
      return res.data;
    } catch (error) {
      console.warn('⚠️ Could not fetch tenders – returning empty list');
      return [];
    }
  },

  /**
   * Fetch single tender by ID
   */
  async getTenderById(id: string) {
    try {
      const res = await apiClient.get(`/tenders/${id}`);
      return res.data;
    } catch (error) {
      console.error(`❌ Failed to fetch tender ${id}`, error);
      throw error;
    }
  },
};
