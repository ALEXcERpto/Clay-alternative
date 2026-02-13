import { useState } from 'react';
import { ValidationStatus } from '../../types';

interface FilterBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
}

export interface FilterState {
  status: string[];
  search: string;
}

export const FilterBuilder = ({
  isOpen,
  onClose,
  onApplyFilters,
}: FilterBuilderProps) => {
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const statuses = [
    { value: ValidationStatus.VALID, label: 'Valid', color: 'bg-green-100 text-green-700' },
    { value: ValidationStatus.INVALID, label: 'Invalid', color: 'bg-red-100 text-red-700' },
    { value: ValidationStatus.ERROR, label: 'Error', color: 'bg-yellow-100 text-yellow-700' },
    { value: ValidationStatus.PENDING, label: 'Pending', color: 'bg-gray-100 text-gray-700' },
    {
      value: ValidationStatus.VALIDATING,
      label: 'Validating',
      color: 'bg-blue-100 text-blue-700',
    },
  ];

  const toggleStatus = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleApply = () => {
    onApplyFilters({ status: statusFilters, search: searchTerm });
    onClose();
  };

  const handleClear = () => {
    setStatusFilters([]);
    setSearchTerm('');
    onApplyFilters({ status: [], search: '' });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Filter Data</h2>
          <button
            onClick={onClose}
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

        {/* Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search emails..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filters */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="space-y-2">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => toggleStatus(status.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 rounded-lg border transition-all
                  ${
                    statusFilters.includes(status.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${
                      statusFilters.includes(status.value)
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }
                  `}
                >
                  {statusFilters.includes(status.value) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded ${status.color}`}
                >
                  {status.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
