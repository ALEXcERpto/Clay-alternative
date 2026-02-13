import { useState } from 'react';

export const Settings = () => {
  const [prospeoApiKey, setProspeoApiKey] = useState('');
  const [icypeasApiKey, setIcypeasApiKey] = useState('');
  const [maxFileSize, setMaxFileSize] = useState('10');
  const [maxRows, setMaxRows] = useState('1000');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to backend/localStorage
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your API keys and application preferences
          </p>
        </div>

        <div className="max-w-3xl">
          {/* API Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              API Configuration
            </h2>

            <div className="space-y-4">
              {/* Prospeo API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prospeo API Key
                </label>
                <input
                  type="password"
                  value={prospeoApiKey}
                  onChange={(e) => setProspeoApiKey(e.target.value)}
                  placeholder="Enter your Prospeo API key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a
                    href="https://prospeo.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    prospeo.io
                  </a>
                </p>
              </div>

              {/* Icypeas API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icypeas API Key
                </label>
                <input
                  type="password"
                  value={icypeasApiKey}
                  onChange={(e) => setIcypeasApiKey(e.target.value)}
                  placeholder="Enter your Icypeas API key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a
                    href="https://icypeas.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    icypeas.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* File Upload Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              File Upload Limits
            </h2>

            <div className="space-y-4">
              {/* Max File Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Max Rows */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Rows
                </label>
                <input
                  type="number"
                  value={maxRows}
                  onChange={(e) => setMaxRows(e.target.value)}
                  min="1"
                  max="10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Validation Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Validation Settings
            </h2>

            <div className="space-y-4">
              {/* Waterfall Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validation Order
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">1.</span>
                    <span className="text-sm text-gray-900">Prospeo</span>
                    <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      Primary
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">2.</span>
                    <span className="text-sm text-gray-900">Icypeas</span>
                    <span className="ml-auto text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Fallback
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Emails are validated using a waterfall approach. If the first service
                  fails, the next one is tried.
                </p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-medium text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Environment</span>
                <span className="font-medium text-gray-900">
                  {import.meta.env.MODE}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API URL</span>
                <span className="font-medium text-gray-900 text-xs">
                  {import.meta.env.VITE_API_URL}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Built with React, TypeScript, and Tailwind CSS. Powered by Prospeo and
                Icypeas email validation APIs.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-2">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Settings saved successfully!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
