import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';
import leadsRoutes from './routes/leads.routes';
import analyticsRoutes from './routes/analytics.routes';
import configRoutes from './routes/config.routes';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

app.use('/api/chat', chatRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/config', configRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 LeadFlow Realty Backend corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
