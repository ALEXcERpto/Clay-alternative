import { Request, Response } from 'express';
import { jobStore } from '../models/ValidationJob';
import { waterfallValidator } from '../services/waterfallValidator';
import { JobStatus, ValidationStatus, ColumnMapping } from '../types';

/**
 * Validation Controller
 * Manages validation job lifecycle
 */
export class ValidationController {
  /**
   * POST /api/validation/start
   * Start validation process for a job
   */
  async startValidation(req: Request, res: Response): Promise<void> {
    try {
      const { jobId, columnMappings } = req.body;

      // Validate request
      if (!jobId || !columnMappings) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'jobId and columnMappings are required',
        });
        return;
      }

      // Get job
      const job = jobStore.get(jobId);

      if (!job) {
        res.status(404).json({
          error: 'Job not found',
          message: `No job found with ID: ${jobId}`,
        });
        return;
      }

      // Validate email mapping exists
      const emailMapping = (columnMappings as ColumnMapping[]).find(
        (m) => m.targetField === 'email'
      );

      if (!emailMapping) {
        res.status(400).json({
          error: 'Email mapping required',
          message: 'You must map at least one column to the email field',
        });
        return;
      }

      // Update job with column mappings
      job.columnMappings = columnMappings;
      job.status = JobStatus.PROCESSING;
      job.updatedAt = new Date();

      // Map data according to column mappings
      job.rows.forEach((row) => {
        columnMappings.forEach((mapping: ColumnMapping) => {
          if (mapping.targetField !== 'skip') {
            row.mappedData[mapping.targetField] =
              row.originalData[mapping.csvColumn];
          }
        });
      });

      jobStore.set(jobId, job);

      // Start validation process (async, don't await)
      this.processValidation(jobId);

      res.status(200).json({
        jobId,
        status: job.status,
        message: 'Validation started',
      });
    } catch (error) {
      console.error('Start validation error:', error);
      res.status(500).json({
        error: 'Failed to start validation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/validation/status/:jobId
   * Get validation job status and results
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;

      const job = jobStore.get(jobId);

      if (!job) {
        res.status(404).json({
          error: 'Job not found',
          message: `No job found with ID: ${jobId}`,
        });
        return;
      }

      res.status(200).json(job);
    } catch (error) {
      console.error('Get status error:', error);
      res.status(500).json({
        error: 'Failed to get status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * DELETE /api/jobs/:jobId
   * Delete a validation job
   */
  async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;

      const deleted = jobStore.delete(jobId);

      if (!deleted) {
        res.status(404).json({
          error: 'Job not found',
          message: `No job found with ID: ${jobId}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Job deleted successfully',
      });
    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({
        error: 'Failed to delete job',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Process validation for all rows in a job
   * This runs asynchronously and updates the job in real-time
   */
  private async processValidation(jobId: string): Promise<void> {
    const job = jobStore.get(jobId);

    if (!job) {
      console.error('Job not found:', jobId);
      return;
    }

    try {
      // Process rows in batches of 10 for better performance
      const batchSize = 10;

      for (let i = 0; i < job.rows.length; i += batchSize) {
        const batch = job.rows.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (row) => {
            const email = row.mappedData.email;

            if (!email) {
              row.validationStatus = ValidationStatus.ERROR;
              row.validationResult = {
                isValid: false,
                validatedBy: null,
                timestamp: new Date(),
                error: 'No email address found',
              };
              job.errorRows++;
              job.processedRows++;
              return;
            }

            // Update status to validating
            row.validationStatus = ValidationStatus.VALIDATING;
            jobStore.set(jobId, job);

            // Validate email using waterfall
            const result = await waterfallValidator.validateEmail(email);

            // Update row with result
            if (result.isValid) {
              row.validationStatus = ValidationStatus.VALID;
              job.validRows++;
            } else if (result.error) {
              row.validationStatus = ValidationStatus.ERROR;
              job.errorRows++;
            } else {
              row.validationStatus = ValidationStatus.INVALID;
              job.invalidRows++;
            }

            row.validationResult = {
              isValid: result.isValid,
              validatedBy: result.validatedBy,
              timestamp: new Date(),
              error: result.error,
              details: result.details,
            };

            job.processedRows++;
            job.updatedAt = new Date();

            // Update job store
            jobStore.set(jobId, job);
          })
        );
      }

      // Mark job as completed
      job.status = JobStatus.COMPLETED;
      job.updatedAt = new Date();
      jobStore.set(jobId, job);

      console.log(`Validation completed for job ${jobId}`);
      console.log(
        `Results: ${job.validRows} valid, ${job.invalidRows} invalid, ${job.errorRows} errors`
      );
    } catch (error) {
      console.error('Validation processing error:', error);
      job.status = JobStatus.FAILED;
      job.updatedAt = new Date();
      jobStore.set(jobId, job);
    }
  }
}

export const validationController = new ValidationController();
