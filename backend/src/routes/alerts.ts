import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../lib/auth.js';
import { visiblePatientsWhere } from '../lib/access.js';

export const alertsRouter = Router();

alertsRouter.use(requireAuth);

// ?status=ACTIVE (por defecto) | RESOLVED | ALL · ?patientId= para filtrar un paciente
alertsRouter.get('/', async (req, res) => {
  const status = String(req.query.status ?? 'ACTIVE').toUpperCase();
  const statusFilter = status === 'ALL' ? {} : { status };

  const scope = {
    patient: visiblePatientsWhere(req.user!),
    ...(req.query.patientId ? { patientId: String(req.query.patientId) } : {}),
  };

  const alerts = await prisma.alert.findMany({
    where: { ...scope, ...statusFilter },
    orderBy: { createdAt: 'desc' },
    include: { patient: { select: { id: true, fullName: true } } },
  });
  res.json({ data: alerts });
});

alertsRouter.patch('/:id/resolve', requireRole('DOCTOR'), async (req, res) => {
  const alert = await prisma.alert.findFirst({
    where: { id: String(req.params.id), patient: { patientProfile: { doctorId: req.user!.sub } } },
  });
  if (!alert) return res.status(404).json({ error: 'Alerta no encontrada.' });

  const updated = await prisma.alert.update({
    where: { id: alert.id },
    data: { status: 'RESOLVED', resolvedAt: new Date() },
  });
  res.json({ data: updated });
});
