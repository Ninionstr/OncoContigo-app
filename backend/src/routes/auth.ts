import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { issueTokens, requireAuth, verifyRefreshToken } from '../lib/auth.js';
import { TREATMENT_TYPES, type Role } from '../lib/constants.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.email(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  diagnosis: z.string().trim().min(2),
  treatmentType: z.enum(TREATMENT_TYPES),
});

function tokensFor(user: { id: string; role: string; email: string }) {
  return issueTokens({ sub: user.id, role: user.role as Role, email: user.email });
}

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ingresa un correo y contraseña válidos.' });
  }
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }
  res.json(tokensFor(user));
});

// Registro público: solo pacientes. Las cuentas médicas se crean por administración.
authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' });
  }
  const { fullName, password, diagnosis, treatmentType } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  if (await prisma.user.findUnique({ where: { email } })) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
  }

  // MVP: se asigna al primer médico disponible.
  const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' }, orderBy: { createdAt: 'asc' } });

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      role: 'PATIENT',
      passwordHash: await bcrypt.hash(password, 10),
      patientProfile: { create: { diagnosis, treatmentType, doctorId: doctor?.id } },
    },
  });
  res.status(201).json(tokensFor(user));
});

authRouter.post('/refresh', async (req, res) => {
  try {
    const { sub } = verifyRefreshToken(String(req.body?.refreshToken ?? ''));
    const user = await prisma.user.findUnique({ where: { id: sub } });
    if (!user) throw new Error('not found');
    res.json(tokensFor(user));
  } catch {
    res.status(401).json({ error: 'Sesión expirada.' });
  }
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { id: true, email: true, fullName: true, role: true, patientProfile: true },
  });
  res.json({ data: user });
});
