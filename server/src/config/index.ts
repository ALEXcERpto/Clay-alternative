import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Email validation APIs
  prospeo: {
    apiKey: process.env.PROSPEO_API_KEY || '',
    apiUrl: process.env.PROSPEO_API_URL || 'https://api.prospeo.io',
  },
  icypeas: {
    apiKey: process.env.ICYPEAS_API_KEY || '',
    apiUrl: process.env.ICYPEAS_API_URL || 'https://api.icypeas.com',
  },

  // File upload limits
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024, // Convert MB to bytes
  maxRows: parseInt(process.env.MAX_ROWS || '1000'),

  // Upload directory
  uploadDir: process.env.UPLOAD_DIR || './uploads',
};
