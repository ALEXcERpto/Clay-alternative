import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcuts = ({ isOpen, onClose }: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl/⌘ + I', description: 'Import CSV file' },
    { key: 'Ctrl/⌘ + E', description: 'Export CSV file' },
    { key: 'Ctrl/⌘ + M', description: 'Open column mapper' },
    { key: 'Ctrl/⌘ + F', description: 'Open filter builder' },
    { key: 'Ctrl/⌘ + K', description: 'Show keyboard shortcuts' },
    { key: 'Ctrl/⌘ + /', description: 'Show column customization' },
    { key: 'Esc', description: 'Close modal/dialog' },
    { key: '/', description: 'Focus search' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Keyboard Shortcuts
          </h2>
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

        <div className="grid grid-cols-1 gap-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700">{shortcut.description}</span>
              <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Press{' '}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
              Esc
            </kbd>{' '}
            or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
};
