import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import eventRoutes from './routes/events';
import locationRoutes from './routes/locations';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/events', eventRoutes);
app.use('/api/locations', locationRoutes);

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
      }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kamakura Event API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});