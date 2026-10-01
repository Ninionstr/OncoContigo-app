import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../lib/auth.js';

export const patientsRouter = Router();

patientsRouter.use(requireAuth, requireRole('DOCTOR'));

const patientSelect = {
  id: true,
  fullName: true,
  email: true,
  patientProfile: { select: { diagnosis: true, treatmentType: true } },
} as const;

patientsRouter.get('/', async (req, res) => {
  const patients = await prisma.user.findMany({
    where: { role: 'PATIENT', patientProfile: { doctorId: req.user!.sub } },
    select: patientSelect,
    orderBy: { fullName: 'asc' },
  });
  res.json({ data: patients });
});

patientsRouter.get('/:id', async (req, res) => {
  const patient = await prisma.user.findFirst({
    where: { id: String(req.params.id), role: 'PATIENT', patientProfile: { doctorId: req.user!.sub } },
    select: {
      ...patientSelect,
      symptomLogs: { orderBy: { loggedDate: 'desc' }, take: 30 },
      alerts: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!patient) return res.status(404).json({ error: 'Paciente no encontrado.' });
  res.json({ data: patient });
});
