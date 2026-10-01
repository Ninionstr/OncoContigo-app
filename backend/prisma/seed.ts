import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { triage } from '../src/lib/triage.js';

const prisma = new PrismaClient();

// Datos de DEMO. Contraseña de todas las cuentas: password123
async function main() {
  await prisma.caregiverInvite.deleteMany();
  await prisma.caregiverLink.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.symptomLog.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const doctor = await prisma.user.create({
    data: { email: 'doctor@test.com', fullName: 'Dra. Camila Rojas', role: 'DOCTOR', passwordHash },
  });

  const caregiver = await prisma.user.create({
    data: { email: 'caregiver@test.com', fullName: 'Pedro González', role: 'CAREGIVER', passwordHash },
  });

  const patients = [
    { email: 'patient1@test.com', fullName: 'María González', diagnosis: 'Cáncer de mama estadio II', treatmentType: 'CHEMOTHERAPY', trend: 'worsening' },
    { email: 'patient2@test.com', fullName: 'Jorge Muñoz', diagnosis: 'Cáncer colorrectal', treatmentType: 'RADIATION', trend: 'stable' },
    { email: 'patient3@test.com', fullName: 'Ana Pérez', diagnosis: 'Linfoma de Hodgkin', treatmentType: 'IMMUNOTHERAPY', trend: 'improving' },
  ] as const;

  for (const p of patients) {
    const user = await prisma.user.create({
      data: {
        email: p.email,
        fullName: p.fullName,
        role: 'PATIENT',
        passwordHash,
        patientProfile: { create: { diagnosis: p.diagnosis, treatmentType: p.treatmentType, doctorId: doctor.id } },
      },
    });

    // Pedro acompaña a su madre, María (patient1)
    const hasCaregiver = p.email === 'patient1@test.com';
    if (hasCaregiver) {
      await prisma.caregiverLink.create({
        data: { patientId: user.id, caregiverId: caregiver.id, relationship: 'Hijo' },
      });
    }

    // 14 días de historial (el registro de "hoy" queda pendiente para patient1)
    for (let daysAgo = 14; daysAgo >= (p.email === 'patient1@test.com' ? 1 : 0); daysAgo--) {
      const t = (14 - daysAgo) / 14;
      const base = p.trend === 'worsening' ? 2 + t * 6 : p.trend === 'improving' ? 7 - t * 5 : 4;
      const jitter = () => Math.round(Math.random() * 2 - 1);
      const clamp = (n: number) => Math.max(0, Math.min(10, Math.round(n)));

      const fever = p.trend === 'worsening' && daysAgo === 1;
      const input = {
        painLevel: clamp(base + jitter()),
        nauseaLevel: clamp(base - 1 + jitter()),
        fatigueLevel: clamp(base + 1 + jitter()),
        appetiteLevel: clamp(10 - base + jitter()),
        fever,
        temperature: fever ? 38.4 : null,
      };
      const { overallStatus, alerts } = triage(input);

      const loggedDate = new Date();
      loggedDate.setDate(loggedDate.getDate() - daysAgo);
      loggedDate.setHours(9, 30, 0, 0);

      await prisma.symptomLog.create({
        data: {
          ...input,
          overallStatus,
          loggedDate,
          patientId: user.id,
          // En los días más difíciles registra el cuidador
          loggedById: hasCaregiver && daysAgo <= 3 ? caregiver.id : user.id,
          alerts: {
            create: alerts.map((a) => ({
              ...a,
              patientId: user.id,
              createdAt: loggedDate,
              // Las alertas antiguas aparecen como ya revisadas
              ...(daysAgo > 3 ? { status: 'RESOLVED', resolvedAt: loggedDate } : {}),
            })),
          },
        },
      });
    }
  }

  console.log('Base de datos poblada con datos de demo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
