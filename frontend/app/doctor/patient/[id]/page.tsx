'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { LoadingCard, PageShell } from '@/components/PageShell';
import { SymptomTrend } from '@/components/SymptomTrend';
import { SymptomTable } from '@/components/SymptomTable';
import { AlertList } from '@/components/AlertList';
import { API_URL, authHeaders, isUnauthorized } from '@/lib/api';
import {
  clinicalStatusLabel,
  statusMeta,
  treatmentLabels,
  type Alert,
  type Symptom,
} from '@/lib/labels';

interface PatientDetail {
  id: string;
  fullName: string;
  email: string;
  patientProfile?: { diagnosis: string; treatmentType: string };
  symptomLogs: Symptom[];
  alerts: Alert[];
}

export default function DoctorPatientPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/patients/${id}`, { headers });
      setPatient(res.data.data);
    } catch (err) {
      console.error(err);
      if (isUnauthorized(err)) router.push('/login');
      else setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (alertId: string) => {
    try {
      await axios.patch(`${API_URL}/alerts/${alertId}/resolve`, {}, { headers: authHeaders() ?? {} });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <LoadingCard text="Cargando ficha del paciente..." />;

  if (notFound || !patient) {
    return (
      <PageShell eyebrow="Panel clínico" title="Paciente" backHref="/doctor/dashboard" maxWidth="max-w-7xl">
        <p className="rounded-3xl border border-brand-100 bg-white p-8 text-center text-ink/70">
          No encontramos este paciente o no está asignado a ti.
        </p>
      </PageShell>
    );
  }

  const latest = patient.symptomLogs[0];

  return (
    <PageShell eyebrow="Ficha clínica" title={patient.fullName} backHref="/doctor/dashboard" maxWidth="max-w-7xl">
      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <InfoCard label="Diagnóstico" value={patient.patientProfile?.diagnosis || 'Sin diagnóstico registrado'} />
        <InfoCard
          label="Tratamiento"
          value={
            treatmentLabels[patient.patientProfile?.treatmentType || ''] ||
            patient.patientProfile?.treatmentType ||
            'No informado'
          }
        />
        <InfoCard
          label="Último registro"
          value={latest ? clinicalStatusLabel[latest.overallStatus] : 'Sin registros'}
          badge={latest ? statusMeta[latest.overallStatus].badge : undefined}
        />
      </div>

      <section className="mb-8 overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="border-b border-brand-50 p-6">
          <p className="text-sm font-medium text-brand-600">Seguimiento</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">Alertas</h2>
        </div>
        <AlertList alerts={patient.alerts} emptyText="Sin alertas para este paciente." onResolve={resolve} />
      </section>

      <section className="mb-8 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand-600">Últimos 30 registros</p>
        <h2 className="mb-4 mt-1 text-2xl font-semibold text-ink">Evolución de síntomas</h2>
        <SymptomTrend symptoms={patient.symptomLogs} />
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        {patient.symptomLogs.length > 0 ? (
          <SymptomTable
            symptoms={patient.symptomLogs}
            statusLabel={(s) => ({ label: clinicalStatusLabel[s.overallStatus], badge: statusMeta[s.overallStatus].badge })}
          />
        ) : (
          <p className="px-6 py-12 text-center text-sm text-ink/60">El paciente aún no tiene registros.</p>
        )}
      </section>
    </PageShell>
  );
}

function InfoCard({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{label}</p>
      {badge ? (
        <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badge}`}>{value}</span>
      ) : (
        <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
      )}
    </div>
  );
}
