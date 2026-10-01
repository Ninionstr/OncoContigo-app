import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../lib/auth.js';
import { generateInviteCode, INVITE_TTL_DAYS, normalizeInviteCode } from '../lib/inviteCode.js';

export const caregiversRouter = Router();

caregiversRouter.use(requireAuth);

const relationship = z.string().trim().max(40).optional();

/**
 * Valida un código y crea el vínculo dentro de una transacción.
 * Devuelve un mensaje de error si el código no sirve.
 */
export async function redeemInvite(
  tx: Prisma.TransactionClient,
  rawCode: string,
  caregiverId: string,
  rel?: string,
): Promise<string | null> {
  const invite = await tx.caregiverInvite.findUnique({ where: { code: normalizeInviteCode(rawCode) } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return 'El código no es válido o ya expiró. Pide uno nuevo al paciente.';
  }
  const existing = await tx.caregiverLink.findUnique({
    where: { patientId_caregiverId: { patientId: invite.patientId, caregiverId } },
  });
  if (existing) return 'Ya acompañas a este paciente.';

  await tx.caregiverInvite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
  await tx.caregiverLink.create({
    data: { patientId: invite.patientId, caregiverId, relationship: rel || null },
  });
  return null;
}

// ── Paciente: gestiona sus cuidadores ───────────────────────────

caregiversRouter.get('/', requireRole('PATIENT'), async (req, res) => {
  const patientId = req.user!.sub;
  const [links, invites] = await Promise.all([
    prisma.caregiverLink.findMany({
      where: { patientId },
      include: { caregiver: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.caregiverInvite.findMany({
      where: { patientId, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  res.json({ data: { caregivers: links, invites } });
});

caregiversRouter.post('/invites', requireRole('PATIENT'), async (req, res) => {
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  const invite = await prisma.caregiverInvite.create({
    data: { code: generateInviteCode(), patientId: req.user!.sub, expiresAt },
  });
  res.status(201).json({ data: invite });
});

caregiversRouter.delete('/invites/:id', requireRole('PATIENT'), async (req, res) => {
  await prisma.caregiverInvite.deleteMany({
    where: { id: String(req.params.id), patientId: req.user!.sub, usedAt: null },
  });
  res.status(204).end();
});

// Revoca el acceso de un cuidador
caregiversRouter.delete('/:caregiverId', requireRole('PATIENT'), async (req, res) => {
  await prisma.caregiverLink.deleteMany({
    where: { patientId: req.user!.sub, caregiverId: String(req.params.caregiverId) },
  });
  res.status(204).end();
});

// ── Cuidador: se vincula a otro paciente con un código ──────────

caregiversRouter.post('/link', requireRole('CAREGIVER'), async (req, res) => {
  const parsed = z.object({ inviteCode: z.string().min(4), relationship }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Ingresa un código válido.' });

  const error = await prisma.$transaction((tx) =>
    redeemInvite(tx, parsed.data.inviteCode, req.user!.sub, parsed.data.relationship),
  );
  if (error) return res.status(400).json({ error });
  res.status(201).json({ ok: true });
});
