import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ColumnMapping } from '../../types';
import { startValidation } from '../../services/validationService';

const TARGET_FIELDS = [
  { value: 'email', label: 'Email' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'company', label: 'Company' },
  { value: 'skip', label: 'Skip' },
] as const;

export const ColumnMapper = () => {
  const {
    csvHeaders,
    autoDetectedMappings,
    jobId,
    setColumnMappings,
    setCurrentStep,
    setIsValidating,
  } = useAppStore();

  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize mappings with auto-detected values
  useEffect(() => {
    const initialMappings: Record<string, string> = {};

    csvHeaders.forEach((header) => {
      const autoDetected = Object.entries(autoDetectedMappings).find(
        ([, csvCol]) => csvCol === header
      )?.[0];

      initialMappings[header] = autoDetected || 'skip';
    });

    setMappings(initialMappings);
  }, [csvHeaders, autoDetectedMappings]);

  const handleMappingChange = (csvColumn: string, targetField: string) => {
    setMappings((prev) => ({
      ...prev,
      [csvColumn]: targetField,
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate: at least one email mapping required
    const hasEmailMapping = Object.values(mappings).some((field) => field === 'email');

    if (!hasEmailMapping) {
      setError('You must map at least one column to the Email field');
      return;
    }

    if (!jobId) {
      setError('No job ID found. Please upload a file first.');
      return;
    }

    // Convert mappings to ColumnMapping array
    const columnMappings: ColumnMapping[] = Object.entries(mappings).map(
      ([csvColumn, targetField]) => ({
        csvColumn,
        targetField: targetField as ColumnMapping['targetField'],
      })
    );

    setSubmitting(true);

    try {
      // Start validation
      await startValidation(jobId, columnMappings);

      // Update store
      setColumnMappings(columnMappings);
      setCurrentStep('validating');
      setIsValidating(true);
    } catch (err: any) {
      console.error('Start validation error:', err);
      setError(err.response?.data?.message || 'Failed to start validation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Map Columns</h2>
        <p className="text-gray-600 mb-6">
          Map your CSV columns to the expected fields. At least one column must be mapped
          to Email.
        </p>

        <div className="space-y-4">
          {csvHeaders.map((header) => (
            <div
              key={header}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{header}</div>
                <div className="text-sm text-gray-500">CSV Column</div>
              </div>

              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>

              <div className="flex-1">
                <select
                  value={mappings[header] || 'skip'}
                  onChange={(e) => handleMappingChange(header, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TARGET_FIELDS.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Starting Validation...' : 'Start Validation'}
          </button>
        </div>
      </div>
    </div>
  );
};
