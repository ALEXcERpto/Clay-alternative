import { useAppStore } from '../../store/useAppStore';
import { JobStatus } from '../../types';

interface ValidationProgressProps {
  compact?: boolean;
}

export const ValidationProgress = ({ compact = false }: ValidationProgressProps) => {
  const { validationJob } = useAppStore();

  if (!validationJob) return null;

  const progressPercentage =
    validationJob.totalRows > 0
      ? Math.round((validationJob.processedRows / validationJob.totalRows) * 100)
      : 0;

  const isProcessing = validationJob.status === JobStatus.PROCESSING;

  // Compact mode for toolbar
  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-600">
              {isProcessing ? 'Validating emails...' : 'Validation complete'}
            </span>
            <span className="text-xs font-medium text-gray-600">
              {validationJob.processedRows} / {validationJob.totalRows}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isProcessing ? 'bg-blue-600' : 'bg-green-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-700 font-medium">
            ✓ {validationJob.validRows}
          </span>
          <span className="text-red-700 font-medium">
            ✗ {validationJob.invalidRows}
          </span>
          <span className="text-yellow-700 font-medium">
            ! {validationJob.errorRows}
          </span>
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Validation Progress
        </h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {isProcessing ? 'Processing...' : 'Completed'}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {validationJob.processedRows} / {validationJob.totalRows} rows
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isProcessing ? 'bg-blue-600' : 'bg-green-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-700">
              {validationJob.validRows}
            </div>
            <div className="text-sm text-green-600 mt-1">Valid</div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-700">
              {validationJob.invalidRows}
            </div>
            <div className="text-sm text-red-600 mt-1">Invalid</div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-700">
              {validationJob.errorRows}
            </div>
            <div className="text-sm text-yellow-600 mt-1">Errors</div>
          </div>
        </div>

        {/* Status Message */}
        {validationJob.status === JobStatus.COMPLETED && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-700 font-medium">
              Validation completed successfully!
            </div>
          </div>
        )}

        {validationJob.status === JobStatus.FAILED && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-700 font-medium">
              Validation failed. Please try again.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
