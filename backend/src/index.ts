import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock property data
interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  amenities: string[];
  totalBedrooms: number;
  totalBathrooms: number;
  squareFeet: number;
  images: string[];
  rating: number;
  reviews: number;
  availability: {
    [key: string]: boolean;
  };
}

const propertyData: Property = {
  id: 'izumi-001',
  name: 'Chácara Izumi - Main Lodge',
  location: 'São Paulo, Brazil',
  description:
    'A stunning premium vacation rental nestled in the heart of Brazilian countryside. Experience luxury, comfort, and natural beauty in perfect harmony.',
  basePrice: 350,
  maxGuests: 12,
  amenities: ['WiFi', 'Pool', 'Hot Tub', 'Sauna', 'Gym', 'Game Room', 'Chef Kitchen', 'Home Theater'],
  totalBedrooms: 6,
  totalBathrooms: 4,
  squareFeet: 8500,
  images: ['/images/main.jpg', '/images/pool.jpg', '/images/bedroom.jpg'],
  rating: 4.9,
  reviews: 247,
  availability: {
    '2024-12-20': true,
    '2024-12-21': true,
    '2024-12-22': false,
    '2024-12-23': false,
    '2024-12-24': true,
    '2024-12-25': true,
  },
};

// Routes

/**
 * GET /api/property
 * Returns mock property data
 */
app.get('/api/property', (req: Request, res: Response) => {
  res.json(propertyData);
});

/**
 * GET /api/property/:id
 * Returns property data for a specific ID
 */
app.get('/api/property/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === propertyData.id) {
    res.json(propertyData);
  } else {
    res.status(404).json({ error: 'Property not found' });
  }
});

/**
 * GET /api/availability/:date
 * Check availability for a specific date
 */
app.get('/api/availability/:date', (req: Request, res: Response) => {
  const { date } = req.params;
  const isAvailable = propertyData.availability[date] ?? null;

  if (isAvailable === null) {
    res.status(404).json({ error: 'Date not found in availability data' });
  } else {
    res.json({ date, available: isAvailable });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
  console.log(`📊 Property API available at http://localhost:${port}/api/property`);
  console.log(`💚 Health check at http://localhost:${port}/health`);
});
