enum ValidationStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  VALID = 'valid',
  INVALID = 'invalid',
  ERROR = 'error'
}

export { ValidationStatus };

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

enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export { JobStatus };

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
