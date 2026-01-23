// Backend API Service

import axios, { AxiosInstance } from 'axios';
import { BidSubmission, AIScoringResponse, TenderCreateData } from '../types';

class APIService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Submit tender for AI scoring
  async scoreTender(bidData: BidSubmission): Promise<AIScoringResponse> {
    try {
      const response = await this.client.post('/api/v1/tender/score', bidData);
      return response.data;
    } catch (error) {
      console.error('Error scoring tender:', error);
      throw this.handleError(error);
    }
  }

  // Get AI scoring explanation
  async getScoringExplanation(bidId: string): Promise<{
    explanation: string;
    factors: Array<{name: string; score: number; weight: number}>;
  }> {
    try {
      const response = await this.client.get(`/api/v1/tender/explain/${bidId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting explanation:', error);
      throw this.handleError(error);
    }
  }

  // Create a new tender (optional - if backend handles storage)
  async createTender(tenderData: TenderCreateData): Promise<{tenderId: string}> {
    try {
      const response = await this.client.post('/api/v1/tender/create', tenderData);
      return response.data;
    } catch (error) {
      console.error('Error creating tender:', error);
      throw this.handleError(error);
    }
  }

  // Health check
  async healthCheck(): Promise<{status: string; version: string}> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(`API Error: ${message}`);
    }
    return error instanceof Error ? error : new Error('Unknown API error');
  }
}

export const apiService = new APIService();