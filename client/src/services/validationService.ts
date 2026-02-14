import { api } from './api';
import axios from 'axios';
import type { UploadResponse, ValidationJob, ColumnMapping } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Upload CSV file
 */
export const uploadCSV = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  console.log('API_URL:', API_URL);
  console.log('Full upload URL:', `${API_URL}/upload`);
  console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

  try {
    // Use axios directly (not the api instance) to avoid Content-Type conflicts
    // Axios will automatically set the correct multipart/form-data with boundary
    const response = await axios.post<UploadResponse>(
      `${API_URL}/upload`,
      formData
    );

    console.log('Upload response:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('Upload failed:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    throw error;
  }
};

/**
 * Start validation process
 */
export const startValidation = async (
  jobId: string,
  columnMappings: ColumnMapping[]
): Promise<{ jobId: string; status: string; message: string }> => {
  const response = await api.post('/validation/start', {
    jobId,
    columnMappings,
  });

  return response.data;
};

/**
 * Get validation status
 */
export const getValidationStatus = async (jobId: string): Promise<ValidationJob> => {
  const response = await api.get<ValidationJob>(`/validation/status/${jobId}`);
  return response.data;
};

/**
 * Export enriched CSV
 */
export const exportCSV = async (jobId: string): Promise<Blob> => {
  const response = await api.get(`/export/${jobId}`, {
    responseType: 'blob',
  });

  return response.data;
};

/**
 * Delete job
 */
export const deleteJob = async (jobId: string): Promise<void> => {
  await api.delete(`/jobs/${jobId}`);
};
