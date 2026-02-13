# GTM Email Enrichment Tool

A Clay-like email enrichment and validation tool built with React and Node.js. Upload CSV files, map columns, and validate emails using a waterfall approach with Prospeo and Icypeas APIs.

## Features

- **CSV Upload**: Drag-and-drop CSV file upload with validation
- **Column Mapping**: Intelligent auto-detection and manual column mapping
- **Waterfall Validation**: Email validation using Prospeo first, fallback to Icypeas
- **Real-time Progress**: Live updates showing validation progress and statistics
- **Spreadsheet View**: ag-Grid powered data grid with status indicators
- **Export Results**: Download enriched CSV with validation results

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **TypeScript** - Type safety
- **PapaParse** - CSV parsing and generation
- **Bottleneck** - API rate limiting
- **Axios** - HTTP client for API calls

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ag-Grid Community** - Data grid
- **Zustand** - State management
- **React Dropzone** - File upload
- **Axios** - HTTP client

## Project Structure

```
GTM/
├── server/                  # Backend Node.js application
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── types/           # TypeScript types
│   │   ├── config/          # Configuration
│   │   └── server.ts        # Entry point
│   ├── uploads/             # Temporary file storage
│   └── package.json
│
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand state
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Prospeo API Key** (sign up at [prospeo.io](https://prospeo.io))
- **Icypeas API Key** (sign up at [icypeas.com](https://icypeas.com))

### 1. Clone and Install

```bash
# Navigate to the project directory
cd GTM

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

#### Backend Configuration

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Add your API keys here
PROSPEO_API_KEY=your_prospeo_api_key_here
PROSPEO_API_URL=https://api.prospeo.io

ICYPEAS_API_KEY=your_icypeas_api_key_here
ICYPEAS_API_URL=https://api.icypeas.com

MAX_FILE_SIZE_MB=10
MAX_ROWS=1000
UPLOAD_DIR=./uploads
```

#### Frontend Configuration

The `client/.env` file is already configured:

```env
VITE_API_URL=http://localhost:5000/api
VITE_POLLING_INTERVAL_MS=2000
```

### 3. Run the Application

#### Option 1: Run separately (for development)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

#### Option 2: Production build

**Build frontend:**
```bash
cd client
npm run build
```

**Run backend:**
```bash
cd server
npm run build
npm start
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## Usage Guide

### 1. Upload CSV File

1. Click or drag-and-drop a CSV file onto the upload area
2. File must be:
   - `.csv` format
   - Less than 10MB
   - Less than 1000 rows
3. Wait for the file to upload and parse

### 2. Map Columns

1. Review the auto-detected column mappings
2. Adjust mappings as needed using dropdowns
3. Ensure at least one column is mapped to "Email"
4. Click "Start Validation"

### 3. Watch Validation Progress

1. Real-time progress bar shows validation status
2. Statistics show valid, invalid, and error counts
3. Spreadsheet view updates in real-time with:
   - Color-coded rows (green=valid, red=invalid, yellow=error)
   - Validation status badges
   - Source of validation (Prospeo or Icypeas)

### 4. Export Results

1. When validation completes, click "Export CSV"
2. Download enriched CSV with new columns:
   - `validation_status`
   - `validated_by`
   - `validation_timestamp`
   - `validation_error` (if any)

## Waterfall Validation Logic

The tool uses a **waterfall approach** for maximum coverage:

```
For each email:
  1. Try Prospeo API
     ├─ If VALID → Mark as valid (source: Prospeo)
     └─ If INVALID or ERROR → Try step 2

  2. Try Icypeas API
     ├─ If VALID → Mark as valid (source: Icypeas)
     └─ If INVALID or ERROR → Mark as invalid
```

This ensures:
- **Higher validation rate** by trying multiple services
- **Cost optimization** by trying cheaper services first
- **Transparency** by tracking which service validated each email

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload CSV file |
| `POST` | `/api/validation/start` | Start validation process |
| `GET` | `/api/validation/status/:jobId` | Get validation status |
| `GET` | `/api/export/:jobId` | Download enriched CSV |
| `DELETE` | `/api/jobs/:jobId` | Delete job data |
| `GET` | `/api/health` | Health check |

## Configuration

### Rate Limiting

The tool includes built-in rate limiting to respect API limits:

- **Prospeo**: 5 concurrent requests, 600ms between requests
- **Icypeas**: 3 concurrent requests, 1000ms between requests

Adjust in `server/src/services/prospeoService.ts` and `icypeasService.ts`:

```typescript
const limiter = new Bottleneck({
  maxConcurrent: 5,  // Adjust based on your API plan
  minTime: 600,      // Milliseconds between requests
});
```

### File Limits

Adjust in `server/.env`:

```env
MAX_FILE_SIZE_MB=10    # Maximum file size in MB
MAX_ROWS=1000          # Maximum rows per CSV
```

## API Integration Notes

### Prospeo API

The current implementation is a template. Update `server/src/services/prospeoService.ts` with the actual Prospeo API structure:

```typescript
// Example - adjust based on real API response
const isValid = data.status === 'valid' || data.deliverable === true;
```

Refer to [Prospeo API Documentation](https://docs.prospeo.io/) for exact endpoint and response format.

### Icypeas API

Similarly, update `server/src/services/icypeasService.ts` based on Icypeas documentation:

```typescript
// Example - adjust based on real API response
const isValid = data.valid === true || data.status === 'valid';
```

Refer to [Icypeas API Documentation](https://docs.icypeas.com/) for exact endpoint and response format.

## Development

### Scripts

**Backend:**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm run type-check   # Type check without building
```

**Frontend:**
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Validators

To add a third email validator:

1. Create service file: `server/src/services/newValidatorService.ts`
2. Update `waterfallValidator.ts` to include new service in chain
3. Update types if needed

### Customizing UI

The UI uses Tailwind CSS for styling. Modify classes in components or update `tailwind.config.js` for global theme changes.

## Troubleshooting

### Backend won't start

- Check if port 5000 is available
- Verify `.env` file exists in `server/` directory
- Run `npm install` in server directory

### Frontend API errors

- Ensure backend is running on port 5000
- Check CORS settings in `server/src/server.ts`
- Verify `VITE_API_URL` in `client/.env`

### Validation not working

- Verify API keys are set in `server/.env`
- Check API service implementations match actual API specs
- Review console logs for API errors

### File upload fails

- Check file size < 10MB
- Verify CSV format is valid
- Check `server/uploads/` directory exists and is writable

## Security Notes

- API keys are stored in `.env` and never committed to git
- File uploads are validated for type and size
- Uploaded files are automatically cleaned up after processing
- CORS is configured to only allow frontend origin

## Production Deployment

Ready to deploy? We've prepared comprehensive guides for you:

### 🚀 Quick Start (15 minutes)
Follow **[DEPLOY-QUICK-START.md](./DEPLOY-QUICK-START.md)** for step-by-step deployment to:
- **Backend**: Railway (free tier available)
- **Frontend**: Vercel (free tier available)

### 📚 Detailed Guide
See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for:
- Complete deployment instructions
- Environment variable setup
- Troubleshooting tips
- Production considerations
- Monitoring and costs

### Deployment Architecture
- **Backend**: Railway (Node.js/Express API)
- **Frontend**: Vercel (React/Vite app)
- **Cost**: Free tier sufficient for moderate usage

## Future Enhancements

- [ ] Add database (PostgreSQL) for persistent job storage
- [ ] Implement user authentication
- [ ] Add more email validators (Hunter.io, ZeroBounce, etc.)
- [ ] Support larger files with background processing
- [ ] Add webhook notifications when validation completes
- [ ] Implement caching for previously validated emails
- [ ] Add bulk export of multiple jobs
- [ ] Create dashboard with historical analytics

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Check API provider documentation
- Review server logs for error details

---

Built with ❤️ using React, Node.js, and TypeScript
