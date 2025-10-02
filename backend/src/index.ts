import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import https from 'https';
import fs from 'fs';
import path from 'path';
import eventRoutes from './routes/events';
import locationRoutes from './routes/locations';
import dataManagementRoutes from './routes/dataManagement';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(bodyParser.json());

app.use('/api/events', eventRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/data', dataManagementRoutes);

app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Kamakura Event Management API', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      events: {
        getAll: 'GET /api/events',
        getById: 'GET /api/events/:id',
        create: 'POST /api/events',
        update: 'PUT /api/events/:id',
        delete: 'DELETE /api/events/:id'
      },
      locations: {
        getAll: 'GET /api/locations',
        getById: 'GET /api/locations/:id',
        create: 'POST /api/locations',
        update: 'PUT /api/locations/:id',
        delete: 'DELETE /api/locations/:id'
      },
      dataManagement: {
        exportEvents: 'GET /api/data/export/events',
        exportLocations: 'GET /api/data/export/locations',
        exportAll: 'GET /api/data/export/all',
        exportEventsCSV: 'GET /api/data/export/events/csv',
        exportLocationsCSV: 'GET /api/data/export/locations/csv',
        importEvents: 'POST /api/data/import/events',
        importLocations: 'POST /api/data/import/locations',
        importAll: 'POST /api/data/import/all',
        importEventsCSV: 'POST /api/data/import/events/csv',
        importLocationsCSV: 'POST /api/data/import/locations/csv'
      }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kamakura Event API is running' });
});

// Translation proxy endpoint to forward to voice recognition app
app.post('/api/translate', async (req, res) => {
  try {
    console.log('Translation proxy request:', req.body);
    
    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`Voice recognition app error: ${response.status}`);
    }
    
    const result = await response.json();
    res.json(result);
    
  } catch (error) {
    console.error('Translation proxy error:', error);
    res.status(500).json({
      error: 'Translation proxy failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});