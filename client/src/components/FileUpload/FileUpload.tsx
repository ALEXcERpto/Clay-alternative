import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadCSV } from '../../services/validationService';
import { useAppStore } from '../../store/useAppStore';

export const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    setUploadedFile,
    setJobId,
    setCSVHeaders,
    setPreviewData,
    setAutoDetectedMappings,
    setCurrentStep,
  } = useAppStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file type
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }

      setError(null);
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

        // Move to mapping step
        setCurrentStep('mapping');
      } catch (err: any) {
        console.error('Upload error:', err);
        setError(err.response?.data?.message || 'Failed to upload file');
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
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />

        <div className="flex flex-col items-center gap-4">
          <svg
            className="w-16 h-16 text-gray-400"
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

          {uploading ? (
            <div>
              <div className="text-lg font-medium text-gray-700">Uploading...</div>
              <div className="text-sm text-gray-500 mt-1">
                Please wait while we process your file
              </div>
            </div>
          ) : isDragActive ? (
            <div>
              <div className="text-lg font-medium text-blue-600">
                Drop your CSV file here
              </div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-medium text-gray-700">
                Drop your CSV file here, or click to browse
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Maximum file size: 10MB, 1000 rows
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
};
