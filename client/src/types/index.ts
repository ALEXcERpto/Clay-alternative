export const ValidationStatus = {
  PENDING: 'pending',
  VALIDATING: 'validating',
  VALID: 'valid',
  INVALID: 'invalid',
  ERROR: 'error'
} as const;

export type ValidationStatus = typeof ValidationStatus[keyof typeof ValidationStatus];

export interface CSVRow {
  rowId: string;
  originalData: Record<string, any>;
  mappedData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    [key: string]: any;
  };
  validationStatus: ValidationStatus;
  validationResult?: {
    isValid: boolean;
    validatedBy: 'prospeo' | 'icypeas' | null;
    timestamp: Date;
    error?: string;
    details?: any;
  };
}

export interface ColumnMapping {
  csvColumn: string;
  targetField: 'email' | 'firstName' | 'lastName' | 'company' | 'skip';
}

export const JobStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

export interface ValidationJob {
  jobId: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  validRows: number;
  invalidRows: number;
  errorRows: number;
  status: JobStatus;
  columnMappings: ColumnMapping[];
  rows: CSVRow[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadResponse {
  jobId: string;
  fileName: string;
  rowCount: number;
  headers: string[];
  preview: Record<string, any>[];
  autoDetected: Record<string, string>;
}
