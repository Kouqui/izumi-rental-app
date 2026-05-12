import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock property data
interface Pricing {
  weekday: number;
  weekendDay: number;
  fullWeekend: number;
  holiday: number;
}

interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  basePrice: number;
  pricing: Pricing;
  maxGuests: number;
  amenities: string[];
  totalBedrooms: number;
  totalBathrooms: number;
  squareFeet: number;
  images: string[];
  rating: number;
  reviews: number;
  holidays: string[];
  availability: {
    [key: string]: boolean;
  };
}

const propertyData: Property = {
  id: 'izumi-001',
  name: 'Chácara Izumi',
  location: 'Campinas - SP, Brasil',
  description:
    'Localizada em Campinas, SP, a Chácara Izumi é um espaço exclusivo para eventos e lazer, com piscina, área verde e estrutura completa para receber até 80 convidados com conforto e sofisticação.',
  basePrice: 800,
  pricing: {
    weekday: 800,
    weekendDay: 1150,
    fullWeekend: 2000,
    holiday: 1150,
  },
  maxGuests: 80,
  amenities: ['WiFi', 'Piscina', '10 Jogos de Mesa', 'Gás', 'Taxa de Limpeza'],
  totalBedrooms: 5,
  totalBathrooms: 3,
  squareFeet: 8500,
  images: [
    '/gallery/piscina-palmeiras.jpeg',
    '/gallery/pergolado.jpeg',
    '/gallery/area-externa.jpeg',
    '/gallery/rede-noite.jpeg',
    '/gallery/area-coberta.jpeg',
    '/gallery/piscina-cascata.jpeg',
    '/gallery/jardim-piscina.jpeg',
    '/gallery/vista-quadra.jpeg',
    '/gallery/salao.jpeg',
    '/gallery/sala-de-estar.jpeg',
    '/gallery/quarto.jpeg',
  ],
  rating: 4.9,
  reviews: 247,
  holidays: [
    // 2026
    '2026-01-01', // Ano Novo
    '2026-04-03', // Sexta-feira Santa
    '2026-04-21', // Tiradentes
    '2026-05-01', // Dia do Trabalho
    '2026-06-04', // Corpus Christi
    '2026-09-07', // Independência
    '2026-10-12', // Nossa Senhora Aparecida
    '2026-11-02', // Finados
    '2026-11-15', // Proclamação da República
    '2026-12-25', // Natal
    // 2027
    '2027-01-01', // Ano Novo
    '2027-03-26', // Sexta-feira Santa
    '2027-04-21', // Tiradentes
    '2027-05-01', // Dia do Trabalho
    '2027-06-17', // Corpus Christi
    '2027-09-07', // Independência
    '2027-10-12', // Nossa Senhora Aparecida
    '2027-11-02', // Finados
    '2027-11-15', // Proclamação da República
    '2027-12-25', // Natal
  ],
  availability: {
    '2026-05-16': true,
    '2026-05-17': true,
    '2026-05-23': false,
    '2026-05-24': false,
    '2026-05-30': true,
    '2026-05-31': true,
    '2026-06-06': true,
    '2026-06-07': true,
    '2026-06-13': false,
    '2026-06-14': false,
    '2026-06-20': true,
    '2026-06-21': true,
    '2026-06-27': true,
    '2026-06-28': true,
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
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
  console.log(`📊 Property API available at http://localhost:${port}/api/property`);
  console.log(`💚 Health check at http://localhost:${port}/health`);
});