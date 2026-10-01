import { prisma } from './prisma.js';
import type { TokenPayload } from './auth.js';

/** Filtro Prisma de los pacientes visibles para el usuario (médico asignado o cuidador vinculado). */
export function visiblePatientsWhere(user: TokenPayload) {
  if (user.role === 'DOCTOR') return { role: 'PATIENT', patientProfile: { doctorId: user.sub } };
  if (user.role === 'CAREGIVER') return { role: 'PATIENT', caregivers: { some: { caregiverId: user.sub } } };
  return { id: user.sub, role: 'PATIENT' };
}

export async function canAccessPatient(user: TokenPayload, patientId: string) {
  const found = await prisma.user.findFirst({
    where: { id: patientId, ...visiblePatientsWhere(user) },
    select: { id: true },
  });
  return Boolean(found);
}
