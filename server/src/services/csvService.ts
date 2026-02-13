import Papa from 'papaparse';
import fs from 'fs';
import { CSVRow, ValidationJob } from '../types';

/**
 * CSV Service for parsing and exporting CSV files
 */
class CSVService {
  /**
   * Parse CSV file and return structured data
   * @param filePath - Path to CSV file
   * @returns Parsed CSV data with headers and rows
   */
  async parseCSV(filePath: string): Promise<{
    headers: string[];
    rows: Record<string, any>[];
    preview: Record<string, any>[];
  }> {
    return new Promise((resolve, reject) => {
      const rows: Record<string, any>[] = [];

      const stream = fs.createReadStream(filePath);

      Papa.parse(stream, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const allRows = results.data as Record<string, any>[];

          // Preview: first 10 rows
          const preview = allRows.slice(0, 10);

          resolve({
            headers,
            rows: allRows,
            preview,
          });
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  }

  /**
   * Generate enriched CSV with validation results
   * @param job - Validation job with results
   * @returns CSV string
   */
  generateEnrichedCSV(job: ValidationJob): string {
    // Prepare data for export
    const enrichedData = job.rows.map((row: CSVRow) => {
      return {
        ...row.originalData,
        validation_status: row.validationStatus,
        validated_by: row.validationResult?.validatedBy || '',
        validation_timestamp: row.validationResult?.timestamp
          ? new Date(row.validationResult.timestamp).toISOString()
          : '',
        validation_error: row.validationResult?.error || '',
      };
    });

    // Convert to CSV
    const csv = Papa.unparse(enrichedData, {
      header: true,
    });

    return csv;
  }

  /**
   * Validate CSV file meets requirements
   * @param filePath - Path to CSV file
   * @param maxRows - Maximum allowed rows
   * @returns Validation result
   */
  async validateCSVFile(
    filePath: string,
    maxRows: number
  ): Promise<{
    valid: boolean;
    error?: string;
    rowCount?: number;
  }> {
    try {
      const { rows } = await this.parseCSV(filePath);

      if (rows.length === 0) {
        return {
          valid: false,
          error: 'CSV file is empty',
        };
      }

      if (rows.length > maxRows) {
        return {
          valid: false,
          error: `CSV file contains ${rows.length} rows, maximum allowed is ${maxRows}`,
          rowCount: rows.length,
        };
      }

      return {
        valid: true,
        rowCount: rows.length,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Auto-detect column mappings based on column names
   * @param headers - CSV column headers
   * @returns Suggested column mappings
   */
  autoDetectColumns(headers: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};

    headers.forEach((header) => {
      const lowerHeader = header.toLowerCase().trim();

      // Email detection
      if (
        lowerHeader.includes('email') ||
        lowerHeader.includes('e-mail') ||
        lowerHeader.includes('mail') ||
        lowerHeader === 'email address'
      ) {
        mappings.email = header;
      }

      // First name detection
      if (
        lowerHeader.includes('first') && lowerHeader.includes('name') ||
        lowerHeader === 'firstname' ||
        lowerHeader === 'first_name' ||
        lowerHeader === 'fname'
      ) {
        mappings.firstName = header;
      }

      // Last name detection
      if (
        lowerHeader.includes('last') && lowerHeader.includes('name') ||
        lowerHeader === 'lastname' ||
        lowerHeader === 'last_name' ||
        lowerHeader === 'lname' ||
        lowerHeader === 'surname'
      ) {
        mappings.lastName = header;
      }

      // Company detection
      if (
        lowerHeader.includes('company') ||
        lowerHeader.includes('organization') ||
        lowerHeader === 'org' ||
        lowerHeader === 'business'
      ) {
        mappings.company = header;
      }
    });

    return mappings;
  }
}

export const csvService = new CSVService();
