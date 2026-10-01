import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../lib/auth.js';
import { triage } from '../lib/triage.js';

export const symptomsRouter = Router();

symptomsRouter.use(requireAuth);

const level = z.number().int().min(0).max(10);
const symptomSchema = z.object({
  painLevel: level,
  fever: z.boolean(),
  temperature: z.number().min(34).max(43).nullish(),
  nauseaLevel: level,
  fatigueLevel: level,
  appetiteLevel: level,
  notes: z.string().trim().max(1000).optional(),
});

function sinceDays(raw: unknown) {
  const days = Math.min(Math.max(Number(raw) || 30, 1), 365);
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));
  return since;
}

symptomsRouter.post('/', requireRole('PATIENT'), async (req, res) => {
  const parsed = symptomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Revisa los valores del registro.' });
  }
  const input = { ...parsed.data, temperature: parsed.data.fever ? parsed.data.temperature : null };
  const { overallStatus, alerts } = triage(input);
  const patientId = req.user!.sub;

  const log = await prisma.symptomLog.create({
    data: {
      ...input,
      overallStatus,
      patientId,
      alerts: { create: alerts.map((a) => ({ ...a, patientId })) },
    },
    include: { alerts: true },
  });
  res.status(201).json({ data: log });
});

symptomsRouter.get('/patient/me', requireRole('PATIENT'), async (req, res) => {
  const logs = await prisma.symptomLog.findMany({
    where: { patientId: req.user!.sub, loggedDate: { gte: sinceDays(req.query.days) } },
    orderBy: { loggedDate: 'desc' },
  });
  res.json({ data: logs });
});

symptomsRouter.get('/patient/:id', requireRole('DOCTOR'), async (req, res) => {
  const owns = await prisma.patientProfile.findFirst({
    where: { userId: String(req.params.id), doctorId: req.user!.sub },
  });
  if (!owns) return res.status(404).json({ error: 'Paciente no encontrado.' });

  const logs = await prisma.symptomLog.findMany({
    where: { patientId: String(req.params.id), loggedDate: { gte: sinceDays(req.query.days) } },
    orderBy: { loggedDate: 'desc' },
  });
  res.json({ data: logs });
});
