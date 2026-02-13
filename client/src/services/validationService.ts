import { api } from './api';
import { UploadResponse, ValidationJob, ColumnMapping } from '../types';

/**
 * Upload CSV file
 */
export const uploadCSV = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
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
