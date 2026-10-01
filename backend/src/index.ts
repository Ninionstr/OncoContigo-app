import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { patientsRouter } from './routes/patients.js';
import { symptomsRouter } from './routes/symptoms.js';
import { alertsRouter } from './routes/alerts.js';

const app = express();
// API_PORT tiene prioridad para no chocar con el PORT del frontend en desarrollo; los hostings suelen inyectar PORT.
const PORT = Number(process.env.API_PORT || process.env.PORT) || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/symptoms', symptomsRouter);
app.use('/api/alerts', alertsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`API de OncoContigo en http://localhost:${PORT}/api`);
});
