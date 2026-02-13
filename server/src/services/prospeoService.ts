import axios, { AxiosError } from 'axios';
import Bottleneck from 'bottleneck';
import { config } from '../config';
import { EmailValidatorResponse } from '../types';

// Rate limiter: 5 concurrent requests, 600ms between requests
const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 600,
});

/**
 * Prospeo email validation service
 *
 * API Documentation: https://docs.prospeo.io/
 * Note: Adjust the endpoint and request format based on actual Prospeo API docs
 */
class ProspeoService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = config.prospeo.apiKey;
    this.apiUrl = config.prospeo.apiUrl;
  }

  /**
   * Validate an email address using Prospeo API
   * @param email - Email address to validate
   * @returns Validation response
   */
  async validateEmail(email: string): Promise<EmailValidatorResponse> {
    if (!this.apiKey) {
      console.warn('Prospeo API key not configured');
      return {
        success: false,
        isValid: false,
        error: 'Prospeo API key not configured',
      };
    }

    try {
      // Rate-limited API call
      const response = await limiter.schedule(async () => {
        return axios.post(
          `${this.apiUrl}/email-verifier`,
          { email },
          {
            headers: {
              'X-KEY': this.apiKey,
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
          }
        );
      });

      // Parse response based on Prospeo API structure
      // Note: Adjust this based on actual API response format
      const data = response.data;

      // Example response structure (adjust based on real API):
      // { status: 'valid' | 'invalid' | 'unknown', ... }
      const isValid = data.status === 'valid' || data.deliverable === true;

      return {
        success: true,
        isValid,
        data: data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      console.error('Prospeo API error:', {
        email,
        status: axiosError.response?.status,
        message: axiosError.message,
      });

      // Check if it's a rate limit error (429)
      if (axiosError.response?.status === 429) {
        return {
          success: false,
          isValid: false,
          error: 'Rate limit exceeded',
        };
      }

      // Check if it's an authentication error (401/403)
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        return {
          success: false,
          isValid: false,
          error: 'Authentication failed - check API key',
        };
      }

      return {
        success: false,
        isValid: false,
        error: axiosError.message || 'Unknown error',
      };
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.validateEmail('test@example.com');
      return result.success;
    } catch (error) {
      return false;
    }
  }
}

export const prospeoService = new ProspeoService();
