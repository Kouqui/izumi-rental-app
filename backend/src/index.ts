import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

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
 * POST /api/contact
 * Sends interest email to the property owner
 */
app.post('/api/contact', async (req: Request, res: Response) => {
  const { name, phone, email, message, checkIn, checkOut, totalPrice } = req.body as {
    name: string;
    phone: string;
    email: string;
    message?: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
  };

  if (!name || !phone || !email || !checkIn || !checkOut) {
    res.status(400).json({ error: 'Campos obrigatórios faltando' });
    return;
  }

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split('-').map(Number);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} de ${months[m - 1]}, ${y}`;
  };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="background:#C44E6D;padding:24px 32px">
        <h2 style="color:#fff;margin:0;font-size:20px">Novo interesse de reserva</h2>
        <p style="color:#f9d0db;margin:4px 0 0;font-size:14px">Chácara Izumi</p>
      </div>
      <div style="padding:28px 32px">
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr style="background:#F4EFE6">
            <td style="padding:12px 16px;font-size:13px;color:#666">Entrada</td>
            <td style="padding:12px 16px;font-weight:600;color:#33292A">${fmtDate(checkIn)}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;color:#666">Saída</td>
            <td style="padding:12px 16px;font-weight:600;color:#33292A">${fmtDate(checkOut)}</td>
          </tr>
          <tr style="background:#F4EFE6">
            <td style="padding:12px 16px;font-size:13px;color:#666">Total estimado</td>
            <td style="padding:12px 16px;font-weight:700;color:#C44E6D;font-size:16px">R$ ${Number(totalPrice).toLocaleString('pt-BR')}</td>
          </tr>
        </table>

        <h3 style="margin:0 0 16px;font-size:15px;color:#33292A;border-bottom:1px solid #eee;padding-bottom:8px">Dados do interessado</h3>
        <p style="margin:6px 0;font-size:14px"><strong>Nome:</strong> ${name}</p>
        <p style="margin:6px 0;font-size:14px"><strong>Telefone:</strong> ${phone}</p>
        <p style="margin:6px 0;font-size:14px"><strong>E-mail:</strong> ${email}</p>
        ${message ? `<p style="margin:16px 0 0;font-size:14px"><strong>Mensagem:</strong><br>${message}</p>` : ''}
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Chácara Izumi" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `Interesse de reserva: ${fmtDate(checkIn)} → ${fmtDate(checkOut)}`,
      html,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    res.status(500).json({ error: 'Falha ao enviar e-mail' });
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