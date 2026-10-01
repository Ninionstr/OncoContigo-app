'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { LoadingCard, PageShell } from '@/components/PageShell';
import { SymptomTrend } from '@/components/SymptomTrend';
import { SymptomTable } from '@/components/SymptomTable';
import { AlertList } from '@/components/AlertList';
import { API_URL, authHeaders, isUnauthorized } from '@/lib/api';
import { caregiverStatusLabel, statusMeta, treatmentLabels, type Alert, type Symptom } from '@/lib/labels';

interface PatientDetail {
  id: string;
  fullName: string;
  patientProfile?: { diagnosis: string; treatmentType: string };
  symptomLogs: Symptom[];
  alerts: Alert[];
}

export default function CaregiverPatientPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }
    axios
      .get(`${API_URL}/patients/${id}`, { headers })
      .then((res) => setPatient(res.data.data))
      .catch((err) => {
        console.error(err);
        if (isUnauthorized(err)) router.push('/login');
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) return <LoadingCard text="Cargando..." />;

  if (!patient) {
    return (
      <PageShell eyebrow="Acompañando" title="Paciente" backHref="/caregiver/dashboard">
        <p className="rounded-3xl border border-brand-100 bg-white p-8 text-center text-ink/70">
          No encontramos a este paciente o ya no tienes acceso.
        </p>
      </PageShell>
    );
  }

  const firstName = patient.fullName.split(' ')[0];

  return (
    <PageShell eyebrow="Acompañando a" title={patient.fullName} backHref="/caregiver/dashboard">
      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink/60">
            {patient.patientProfile?.diagnosis} ·{' '}
            {treatmentLabels[patient.patientProfile?.treatmentType || ''] || 'Tratamiento no informado'}
          </p>
          {patient.symptomLogs[0] && (
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusMeta[patient.symptomLogs[0].overallStatus].badge}`}
            >
              Último registro: {caregiverStatusLabel[patient.symptomLogs[0].overallStatus]}
            </span>
          )}
        </div>
        <Link
          href={`/caregiver/patient/${patient.id}/symptoms/new`}
          className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          Registrar síntomas
        </Link>
      </div>

      <section className="mb-8 overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="border-b border-brand-50 p-6">
          <h2 className="text-xl font-semibold text-ink">Alertas</h2>
          <p className="mt-1 text-sm text-ink/60">
            El equipo médico de {firstName} recibe estas alertas automáticamente.
          </p>
        </div>
        <AlertList alerts={patient.alerts} emptyText="Sin alertas por ahora." />
      </section>

      <section className="mb-8 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-ink">Evolución</h2>
        <SymptomTrend symptoms={patient.symptomLogs} />
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        {patient.symptomLogs.length > 0 ? (
          <SymptomTable
            symptoms={patient.symptomLogs}
            statusLabel={(s) => ({ label: caregiverStatusLabel[s.overallStatus], badge: statusMeta[s.overallStatus].badge })}
          />
        ) : (
          <p className="px-6 py-12 text-center text-sm text-ink/60">Aún no hay registros.</p>
        )}
      </section>
    </PageShell>
  );
}
