import { useAppStore } from './store/useAppStore';
import { usePolling } from './hooks/usePolling';
import { FileUpload } from './components/FileUpload';
import { ColumnMapper } from './components/ColumnMapper';
import { ValidationProgress } from './components/ValidationProgress';
import { SpreadsheetView } from './components/SpreadsheetView';
import { ExportButton } from './components/ExportButton';

function App() {
  const { currentStep, jobId, isValidating, resetStore } = useAppStore();

  // Poll for validation status when validating
  usePolling(jobId, isValidating);

  // Uncomment this if you want to reset state on page load during development
  // useEffect(() => {
  //   resetStore();
  // }, [resetStore]);

  const handleReset = () => {
    if (confirm('Are you sure you want to start over?')) {
      resetStore();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              GTM Email Enrichment Tool
            </h1>
            <p className="text-lg text-gray-600">
              Upload a CSV file, map columns, and validate emails using Prospeo and
              Icypeas
            </p>
          </div>

          {/* Reset Button */}
          {currentStep !== 'upload' && (
            <div className="mt-4 text-center">
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Start Over
              </button>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {/* Step 1: Upload */}
            <div className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep === 'upload'
                    ? 'bg-blue-600 text-white'
                    : currentStep === 'mapping' ||
                      currentStep === 'validating' ||
                      currentStep === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Upload CSV</div>
              </div>
            </div>

            <div className="flex-1 h-1 bg-gray-300 mx-4">
              <div
                className={`h-full transition-all duration-300 ${
                  currentStep === 'mapping' ||
                  currentStep === 'validating' ||
                  currentStep === 'completed'
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}
                style={{
                  width:
                    currentStep === 'mapping' ||
                    currentStep === 'validating' ||
                    currentStep === 'completed'
                      ? '100%'
                      : '0%',
                }}
              />
            </div>

            {/* Step 2: Map */}
            <div className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep === 'mapping'
                    ? 'bg-blue-600 text-white'
                    : currentStep === 'validating' || currentStep === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Map Columns</div>
              </div>
            </div>

            <div className="flex-1 h-1 bg-gray-300 mx-4">
              <div
                className={`h-full transition-all duration-300 ${
                  currentStep === 'validating' || currentStep === 'completed'
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}
                style={{
                  width:
                    currentStep === 'validating' || currentStep === 'completed'
                      ? '100%'
                      : '0%',
                }}
              />
            </div>

            {/* Step 3: Validate */}
            <div className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep === 'validating' || currentStep === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                3
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Validate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Upload Step */}
          {currentStep === 'upload' && <FileUpload />}

          {/* Mapping Step */}
          {currentStep === 'mapping' && <ColumnMapper />}

          {/* Validating/Completed Step */}
          {(currentStep === 'validating' || currentStep === 'completed') && (
            <>
              <ValidationProgress />
              <SpreadsheetView />
              <ExportButton />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="max-w-4xl mx-auto mt-12 text-center text-sm text-gray-500">
          <p>
            Powered by Prospeo and Icypeas email validation services
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
