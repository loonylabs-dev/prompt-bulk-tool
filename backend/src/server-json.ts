import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { JsonDatabase } from './database/jsonDatabase';
import { errorHandler } from './middleware/errorHandler';

// Import JSON-compatible route handlers
import { createJsonTemplateRoutes } from './routes/jsonTemplates';
import { createJsonVariableRoutes } from './routes/jsonVariables';
import { createJsonGenerationRoutes } from './routes/jsonGeneration';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'JSON-based'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Starting Prompt Bulk Tool Backend (JSON Database)...');
    
    // Initialize JSON database connection
    const jsonDb = JsonDatabase.getInstance();
    await jsonDb.connect();
    
    // Setup API routes with JSON database
    app.use('/api/templates', createJsonTemplateRoutes(jsonDb));
    app.use('/api/variables', createJsonVariableRoutes(jsonDb));
    app.use('/api/generation', createJsonGenerationRoutes(jsonDb));
    
    // Simple automation placeholder
    app.get('/api/automation/targets', (req, res) => {
      res.json({
        success: true,
        data: [],
        message: 'Automation targets endpoint - JSON version'
      });
    });
    
    // Error handling middleware
    app.use(errorHandler);

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
      });
    });
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💾 Database: JSON-based (Cross-platform compatible)`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();