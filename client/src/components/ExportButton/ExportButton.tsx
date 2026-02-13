import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { exportCSV } from '../../services/validationService';
import { JobStatus } from '../../types';

export const ExportButton = () => {
  const { validationJob } = useAppStore();
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!validationJob?.jobId) {
      setError('No validation job found');
      return;
    }

    setError(null);
    setExporting(true);

    try {
      // Download CSV
      const blob = await exportCSV(validationJob.jobId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enriched_${validationJob.fileName}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err.response?.data?.message || 'Failed to export file');
    } finally {
      setExporting(false);
    }
  };

  // Only show button when validation is completed
  if (validationJob?.status !== JobStatus.COMPLETED) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Export Enriched Data
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Download your validated CSV with enrichment results
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
};
