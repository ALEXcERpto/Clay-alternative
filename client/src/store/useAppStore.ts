import { create } from 'zustand';
import type { ValidationJob, ColumnMapping } from '../types';

interface AppState {
  // Upload state
  uploadedFile: File | null;
  jobId: string | null;
  csvHeaders: string[];
  previewData: Record<string, any>[];
  autoDetectedMappings: Record<string, string>;

  // Mapping state
  columnMappings: ColumnMapping[];

  // Validation state
  validationJob: ValidationJob | null;
  isValidating: boolean;

  // UI state
  currentStep: 'upload' | 'mapping' | 'validating' | 'completed';

  // Actions
  setUploadedFile: (file: File) => void;
  setJobId: (id: string) => void;
  setCSVHeaders: (headers: string[]) => void;
  setPreviewData: (data: Record<string, any>[]) => void;
  setAutoDetectedMappings: (mappings: Record<string, string>) => void;
  setColumnMappings: (mappings: ColumnMapping[]) => void;
  setValidationJob: (job: ValidationJob) => void;
  setIsValidating: (isValidating: boolean) => void;
  setCurrentStep: (step: 'upload' | 'mapping' | 'validating' | 'completed') => void;
  resetStore: () => void;
}

const initialState = {
  uploadedFile: null,
  jobId: null,
  csvHeaders: [],
  previewData: [],
  autoDetectedMappings: {},
  columnMappings: [],
  validationJob: null,
  isValidating: false,
  currentStep: 'upload' as const,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setJobId: (id) => set({ jobId: id }),
  setCSVHeaders: (headers) => set({ csvHeaders: headers }),
  setPreviewData: (data) => set({ previewData: data }),
  setAutoDetectedMappings: (mappings) => set({ autoDetectedMappings: mappings }),
  setColumnMappings: (mappings) => set({ columnMappings: mappings }),
  setValidationJob: (job) => set({ validationJob: job }),
  setIsValidating: (isValidating) => set({ isValidating }),
  setCurrentStep: (step) => set({ currentStep: step }),
  resetStore: () => set(initialState),
}));
