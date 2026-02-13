import { Request, Response } from 'express';
import { jobStore } from '../models/ValidationJob';
import { csvService } from '../services/csvService';

/**
 * Export Controller
 * Handles CSV export with validation results
 */
export class ExportController {
  /**
   * GET /api/export/:jobId
   * Export enriched CSV with validation results
   */
  async exportCSV(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;

      // Get job
      const job = jobStore.get(jobId);

      if (!job) {
        res.status(404).json({
          error: 'Job not found',
          message: `No job found with ID: ${jobId}`,
        });
        return;
      }

      // Generate enriched CSV
      const csv = csvService.generateEnrichedCSV(job);

      // Set headers for file download
      const fileName = `enriched_${job.fileName}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', Buffer.byteLength(csv));

      // Send CSV
      res.status(200).send(csv);
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({
        error: 'Export failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const exportController = new ExportController();
