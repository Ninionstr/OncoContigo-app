import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../lib/auth.js';
import { visiblePatientsWhere } from '../lib/access.js';

export const patientsRouter = Router();

// Médicos ven a sus pacientes asignados; cuidadores, a los pacientes que acompañan.
patientsRouter.use(requireAuth, requireRole('DOCTOR', 'CAREGIVER'));

const patientSelect = {
  id: true,
  fullName: true,
  email: true,
  patientProfile: { select: { diagnosis: true, treatmentType: true } },
} as const;

const loggedBySelect = { loggedBy: { select: { fullName: true, role: true } } } as const;

patientsRouter.get('/', async (req, res) => {
  const patients = await prisma.user.findMany({
    where: visiblePatientsWhere(req.user!),
    select: {
      ...patientSelect,
      symptomLogs: { orderBy: { loggedDate: 'desc' }, take: 1, include: loggedBySelect },
      _count: { select: { alerts: { where: { status: 'ACTIVE' } } } },
      ...(req.user!.role === 'CAREGIVER'
        ? { caregivers: { where: { caregiverId: req.user!.sub }, select: { relationship: true } } }
        : {}),
    },
    orderBy: { fullName: 'asc' },
  });
  res.json({ data: patients });
});

patientsRouter.get('/:id', async (req, res) => {
  const patient = await prisma.user.findFirst({
    where: { id: String(req.params.id), ...visiblePatientsWhere(req.user!) },
    select: {
      ...patientSelect,
      symptomLogs: { orderBy: { loggedDate: 'desc' }, take: 30, include: loggedBySelect },
      alerts: { orderBy: { createdAt: 'desc' }, take: 20 },
      caregivers: {
        select: { relationship: true, caregiver: { select: { id: true, fullName: true } } },
      },
    },
  });
  if (!patient) return res.status(404).json({ error: 'Paciente no encontrado.' });
  res.json({ data: patient });
});
