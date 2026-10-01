import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../lib/auth.js';
import { triage } from '../lib/triage.js';
import { canAccessPatient } from '../lib/access.js';

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
  // Solo para cuidadores: a qué paciente corresponde el registro
  patientId: z.string().optional(),
});

const loggedBy = { loggedBy: { select: { fullName: true, role: true } } } as const;

function sinceDays(raw: unknown) {
  const days = Math.min(Math.max(Number(raw) || 30, 1), 365);
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));
  return since;
}

symptomsRouter.post('/', requireRole('PATIENT', 'CAREGIVER'), async (req, res) => {
  const parsed = symptomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Revisa los valores del registro.' });
  }
  const { patientId: requestedPatientId, ...data } = parsed.data;
  const input = { ...data, temperature: data.fever ? data.temperature : null };
  const { overallStatus, alerts } = triage(input);

  const patientId = req.user!.role === 'CAREGIVER' ? requestedPatientId : req.user!.sub;
  if (!patientId || !(await canAccessPatient(req.user!, patientId))) {
    return res.status(404).json({ error: 'Paciente no encontrado.' });
  }

  const log = await prisma.symptomLog.create({
    data: {
      ...input,
      overallStatus,
      patientId,
      loggedById: req.user!.sub,
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
    include: loggedBy,
  });
  res.json({ data: logs });
});

symptomsRouter.get('/patient/:id', requireRole('DOCTOR', 'CAREGIVER'), async (req, res) => {
  if (!(await canAccessPatient(req.user!, String(req.params.id)))) {
    return res.status(404).json({ error: 'Paciente no encontrado.' });
  }

  const logs = await prisma.symptomLog.findMany({
    where: { patientId: String(req.params.id), loggedDate: { gte: sinceDays(req.query.days) } },
    orderBy: { loggedDate: 'desc' },
    include: loggedBy,
  });
  res.json({ data: logs });
});
