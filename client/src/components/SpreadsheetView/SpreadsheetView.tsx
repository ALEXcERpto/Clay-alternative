import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { useAppStore } from '../../store/useAppStore';
import { ValidationStatus } from '../../types';
import type { CSVRow } from '../../types';

// Custom cell renderer for validation status
const StatusRenderer = (props: any) => {
  const status: ValidationStatus = props.value;

  const statusConfig = {
    [ValidationStatus.PENDING]: {
      label: 'Pending',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
    },
    [ValidationStatus.VALIDATING]: {
      label: 'Validating...',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
    },
    [ValidationStatus.VALID]: {
      label: 'Valid',
      bg: 'bg-green-100',
      text: 'text-green-700',
    },
    [ValidationStatus.INVALID]: {
      label: 'Invalid',
      bg: 'bg-red-100',
      text: 'text-red-700',
    },
    [ValidationStatus.ERROR]: {
      label: 'Error',
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

// Custom cell renderer for validated by
const ValidatedByRenderer = (props: any) => {
  const validatedBy = props.data.validationResult?.validatedBy;

  if (!validatedBy) return <span className="text-gray-400">-</span>;

  return (
    <span className="text-sm font-medium text-gray-700">
      {validatedBy === 'prospeo' ? 'Prospeo' : 'Icypeas'}
    </span>
  );
};

export const SpreadsheetView = () => {
  const { validationJob, csvHeaders } = useAppStore();

  // Generate column definitions
  const columnDefs = useMemo<ColDef[]>(() => {
    if (!validationJob) return [];

    const columns: ColDef[] = [
      {
        headerName: 'Status',
        field: 'validationStatus',
        cellRenderer: StatusRenderer,
        width: 120,
        pinned: 'left',
      },
      {
        headerName: 'Validated By',
        field: 'validationResult.validatedBy',
        cellRenderer: ValidatedByRenderer,
        width: 130,
      },
    ];

    // Add columns for each CSV header
    csvHeaders.forEach((header) => {
      columns.push({
        headerName: header,
        field: `originalData.${header}`,
        width: 150,
      });
    });

    return columns;
  }, [validationJob, csvHeaders]);

  // Row data
  const rowData = useMemo(() => {
    return validationJob?.rows || [];
  }, [validationJob]);

  // Row class rules for color coding
  const getRowClass = (params: any) => {
    const row: CSVRow = params.data;

    switch (row.validationStatus) {
      case ValidationStatus.VALID:
        return 'bg-green-50 hover:bg-green-100';
      case ValidationStatus.INVALID:
        return 'bg-red-50 hover:bg-red-100';
      case ValidationStatus.ERROR:
        return 'bg-yellow-50 hover:bg-yellow-100';
      case ValidationStatus.VALIDATING:
        return 'bg-blue-50 hover:bg-blue-100';
      default:
        return '';
    }
  };

  if (!validationJob) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Validation Results</h2>

        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            getRowClass={getRowClass}
            animateRows={true}
            suppressCellFocus={true}
          />
        </div>
      </div>
    </div>
  );
};
