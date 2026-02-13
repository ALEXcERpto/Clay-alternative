import { useRef, useEffect } from 'react';

interface Column {
  id: string;
  name: string;
  visible: boolean;
}

interface ColumnCustomizationProps {
  columns: Column[];
  onToggleColumn: (columnId: string) => void;
  onClose: () => void;
}

export const ColumnCustomization = ({
  columns,
  onToggleColumn,
  onClose,
}: ColumnCustomizationProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const visibleCount = columns.filter((c) => c.visible).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slideDown"
    >
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Customize Columns</h3>
        <p className="text-xs text-gray-500 mt-1">
          {visibleCount} of {columns.length} visible
        </p>
      </div>

      <div className="max-h-80 overflow-y-auto p-2">
        {columns.map((column) => (
          <button
            key={column.id}
            onClick={() => onToggleColumn(column.id)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${
                  column.visible
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }
              `}
            >
              {column.visible && (
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
            <span className="text-sm text-gray-700">{column.name}</span>
          </button>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
        <button
          onClick={() => {
            columns.forEach((col) => {
              if (!col.visible) onToggleColumn(col.id);
            });
          }}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
        >
          Show All
        </button>
        <button
          onClick={() => {
            columns.forEach((col) => {
              if (col.visible && col.id !== 'status') onToggleColumn(col.id);
            });
          }}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
