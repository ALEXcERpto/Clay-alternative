import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { csvService } from '../services/csvService';
import { jobStore } from '../models/ValidationJob';
import { ValidationJob, JobStatus, ValidationStatus } from '../types';
import { config } from '../config';
import fs from 'fs';

/**
 * Upload Controller
 * Handles CSV file uploads and job creation
 */
export class UploadController {
  /**
   * POST /api/upload
   * Upload CSV file and create validation job
   */
  async uploadCSV(req: Request, res: Response): Promise<void> {
    try {
      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          error: 'No file uploaded',
          message: 'Please upload a CSV file',
        });
        return;
      }

      const file = req.file;
      const filePath = file.path;

      // Validate file type
      if (!file.originalname.endsWith('.csv')) {
        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(400).json({
          error: 'Invalid file type',
          message: 'Only CSV files are allowed',
        });
        return;
      }

      // Validate CSV file
      const validation = await csvService.validateCSVFile(
        filePath,
        config.maxRows
      );

      if (!validation.valid) {
        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(400).json({
          error: 'Invalid CSV file',
          message: validation.error,
        });
        return;
      }

      // Parse CSV
      const { headers, rows, preview } = await csvService.parseCSV(filePath);

      // Auto-detect column mappings
      const autoDetected = csvService.autoDetectColumns(headers);

      // Create validation job
      const jobId = uuidv4();

      const job: ValidationJob = {
        jobId,
        fileName: file.originalname,
        totalRows: rows.length,
        processedRows: 0,
        validRows: 0,
        invalidRows: 0,
        errorRows: 0,
        status: JobStatus.PENDING,
        columnMappings: [],
        rows: rows.map((rowData, index) => ({
          rowId: `${jobId}-${index}`,
          originalData: rowData,
          mappedData: {},
          validationStatus: ValidationStatus.PENDING,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store job
      jobStore.set(jobId, job);

      // Clean up uploaded file (we've parsed it into memory)
      fs.unlinkSync(filePath);

      // Return response
      res.status(200).json({
        jobId,
        fileName: file.originalname,
        rowCount: rows.length,
        headers,
        preview,
        autoDetected,
      });
    } catch (error) {
      console.error('Upload error:', error);

      // Clean up uploaded file if it exists
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }

      res.status(500).json({
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const uploadController = new UploadController();
