import axios, { AxiosError } from 'axios';
import Bottleneck from 'bottleneck';
import { config } from '../config';
import { EmailValidatorResponse } from '../types';

// Rate limiter: 3 concurrent requests, 1000ms between requests
const limiter = new Bottleneck({
  maxConcurrent: 3,
  minTime: 1000,
});

/**
 * Icypeas email validation service
 *
 * API Documentation: https://docs.icypeas.com/
 * Note: Adjust the endpoint and request format based on actual Icypeas API docs
 */
class IcypeasService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = config.icypeas.apiKey;
    this.apiUrl = config.icypeas.apiUrl;
  }

  /**
   * Validate an email address using Icypeas API
   * @param email - Email address to validate
   * @returns Validation response
   */
  async validateEmail(email: string): Promise<EmailValidatorResponse> {
    if (!this.apiKey) {
      console.warn('Icypeas API key not configured');
      return {
        success: false,
        isValid: false,
        error: 'Icypeas API key not configured',
      };
    }

    try {
      // Rate-limited API call
      const response = await limiter.schedule(async () => {
        return axios.post(
          `${this.apiUrl}/v1/verify`,
          { email },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
          }
        );
      });

      // Parse response based on Icypeas API structure
      // Note: Adjust this based on actual API response format
      const data = response.data;

      // Example response structure (adjust based on real API):
      // { valid: true/false, status: 'valid' | 'invalid', ... }
      const isValid = data.valid === true || data.status === 'valid';

      return {
        success: true,
        isValid,
        data: data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      console.error('Icypeas API error:', {
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

export const icypeasService = new IcypeasService();
