import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { usePolling } from '../hooks/usePolling';
import { SpreadsheetView } from '../components/SpreadsheetView';
import { ValidationProgress } from '../components/ValidationProgress';
import { ColumnMapper } from '../components/ColumnMapper';
import { KeyboardShortcuts } from '../components/KeyboardShortcuts';
import { FilterBuilder } from '../components/FilterBuilder';
import type { FilterState } from '../components/FilterBuilder';
import { ColumnCustomization } from '../components/ColumnCustomization';
import { uploadCSV } from '../services/validationService';
import { exportCSV } from '../services/validationService';
import { useDropzone } from 'react-dropzone';

export const Workspace = () => {
  const {
    jobId,
    isValidating,
    validationJob,
    setUploadedFile,
    setJobId,
    setCSVHeaders,
    setPreviewData,
    setAutoDetectedMappings,
    setCurrentStep,
  } = useAppStore();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showColumnMapper, setShowColumnMapper] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [showColumnCustomization, setShowColumnCustomization] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ status: [], search: '' });

  // Poll for validation status when validating
  usePolling(jobId, isValidating);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + K: Show keyboard shortcuts
      if (modifier && e.key === 'k') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }

      // Ctrl/Cmd + I: Import
      if (modifier && e.key === 'i') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
      }

      // Ctrl/Cmd + E: Export
      if (modifier && e.key === 'e') {
        e.preventDefault();
        if (jobId) handleExport();
      }

      // Ctrl/Cmd + M: Map columns
      if (modifier && e.key === 'm') {
        e.preventDefault();
        if (jobId) setShowColumnMapper(true);
      }

      // Ctrl/Cmd + F: Filter
      if (modifier && e.key === 'f') {
        e.preventDefault();
        setShowFilterBuilder(true);
      }

      // Ctrl/Cmd + /: Column customization
      if (modifier && e.key === '/') {
        e.preventDefault();
        setShowColumnCustomization(!showColumnCustomization);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [jobId, showColumnCustomization]);

  // Handle file upload
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file type
      if (!file.name.endsWith('.csv')) {
        setUploadError('Please upload a CSV file');
        return;
      }

      setUploadError(null);
      setUploading(true);

      try {
        // Upload file
        const response = await uploadCSV(file);

        // Update store
        setUploadedFile(file);
        setJobId(response.jobId);
        setCSVHeaders(response.headers);
        setPreviewData(response.preview);
        setAutoDetectedMappings(response.autoDetected);
        setCurrentStep('mapping');

        // Show column mapper
        setShowColumnMapper(true);
      } catch (err: any) {
        console.error('Upload error:', err);
        setUploadError(err.response?.data?.message || 'Failed to upload file');
      } finally {
        setUploading(false);
      }
    },
    [
      setUploadedFile,
      setJobId,
      setCSVHeaders,
      setPreviewData,
      setAutoDetectedMappings,
      setCurrentStep,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
    noClick: !!jobId, // Disable click when file is loaded
    noDrag: !!jobId, // Disable drag when file is loaded
  });

  // Handle export
  const handleExport = async () => {
    if (!jobId) return;

    setExporting(true);
    try {
      const blob = await exportCSV(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enriched_${validationJob?.fileName || 'export'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Export error:', err);
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Workspace</h2>
              {validationJob && (
                <span className="text-sm text-gray-500">
                  {validationJob.fileName}
                </span>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Import Button */}
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {uploading ? 'Importing...' : jobId ? 'Import New' : 'Import CSV'}
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={!jobId || exporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>

              {/* Filter Button */}
              {jobId && (
                <button
                  onClick={() => setShowFilterBuilder(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 hover-lift transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter
                  {(filters.status.length > 0 || filters.search) && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full animate-scaleIn">
                      {filters.status.length || '•'}
                    </span>
                  )}
                </button>
              )}

              {/* Map Columns Button */}
              {jobId && (
                <button
                  onClick={() => setShowColumnMapper(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 hover-lift transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Map Columns
                </button>
              )}

              {/* Column Customization */}
              {jobId && (
                <div className="relative">
                  <button
                    onClick={() => setShowColumnCustomization(!showColumnCustomization)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 hover-lift transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    Columns
                  </button>
                  {showColumnCustomization && (
                    <ColumnCustomization
                      columns={[
                        { id: 'status', name: 'Status', visible: true },
                        { id: 'validatedBy', name: 'Validated By', visible: true },
                        { id: 'email', name: 'Email', visible: true },
                        { id: 'firstName', name: 'First Name', visible: true },
                        { id: 'lastName', name: 'Last Name', visible: true },
                        { id: 'company', name: 'Company', visible: true },
                      ]}
                      onToggleColumn={(id) => console.log('Toggle column:', id)}
                      onClose={() => setShowColumnCustomization(false)}
                    />
                  )}
                </div>
              )}

              {/* Keyboard Shortcuts Button */}
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover-lift transition-all"
                title="Keyboard Shortcuts (Ctrl/⌘ + K)"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Validation Progress Bar */}
          {isValidating && validationJob && (
            <div className="mt-3">
              <ValidationProgress compact />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {!jobId ? (
          // Empty state - show drop zone
          <div className="h-full flex items-center justify-center p-8">
            <div
              {...getRootProps()}
              className={`
                max-w-2xl w-full border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-colors duration-200
                ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }
              `}
            >
              <input {...getInputProps()} />
              <svg
                className="w-20 h-20 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {isDragActive ? (
                <div className="text-xl font-medium text-blue-600">
                  Drop your CSV file here
                </div>
              ) : (
                <>
                  <div className="text-xl font-medium text-gray-700 mb-2">
                    Drop your CSV file here, or click to browse
                  </div>
                  <div className="text-sm text-gray-500">
                    Maximum file size: 10MB, 1000 rows
                  </div>
                </>
              )}
              {uploadError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-600">{uploadError}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Show spreadsheet
          <div className="h-full p-6">
            <SpreadsheetView />
          </div>
        )}
      </div>

      {/* Column Mapper Modal */}
      {showColumnMapper && jobId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto animate-slideUp">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Map Columns</h2>
              <button
                onClick={() => setShowColumnMapper(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ColumnMapper onComplete={() => setShowColumnMapper(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Filter Builder Modal */}
      <FilterBuilder
        isOpen={showFilterBuilder}
        onClose={() => setShowFilterBuilder(false)}
        onApplyFilters={setFilters}
      />
    </div>
  );
};
