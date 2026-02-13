import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { uploadController } from '../controllers/uploadController';
import { validationController } from '../controllers/validationController';
import { exportController } from '../controllers/exportController';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload routes
router.post('/upload', upload.single('file'), (req, res) => {
  uploadController.uploadCSV(req, res);
});

// Validation routes
router.post('/validation/start', (req, res) => {
  validationController.startValidation(req, res);
});

router.get('/validation/status/:jobId', (req, res) => {
  validationController.getStatus(req, res);
});

// Export routes
router.get('/export/:jobId', (req, res) => {
  exportController.exportCSV(req, res);
});

// Job management routes
router.delete('/jobs/:jobId', (req, res) => {
  validationController.deleteJob(req, res);
});

export default router;
