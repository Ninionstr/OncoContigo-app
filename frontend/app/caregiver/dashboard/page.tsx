'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ClipboardList, HeartHandshake, UserPlus } from 'lucide-react';
import { LoadingCard, PageShell } from '@/components/PageShell';
import { API_URL, apiErrorMessage, authHeaders, isUnauthorized } from '@/lib/api';
import { caregiverStatusLabel, isToday, statusMeta, treatmentLabels, type Symptom } from '@/lib/labels';

interface CaredPatient {
  id: string;
  fullName: string;
  patientProfile?: { diagnosis: string; treatmentType: string };
  symptomLogs: Symptom[];
  _count: { alerts: number };
  caregivers?: { relationship: string | null }[];
}

export default function CaregiverDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<CaredPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/patients`, { headers });
      setPatients(res.data.data);
    } catch (err) {
      console.error(err);
      if (isUnauthorized(err)) router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) return <LoadingCard text="Cargando a quienes acompañas..." />;

  return (
    <PageShell eyebrow="Acompañando" title="OncoContigo">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-ink">Las personas que acompañas</h2>
        <p className="mt-1 text-sm text-ink/70">
          Revisa cómo están, registra sus síntomas cuando lo necesiten y mantente al tanto de sus alertas.
        </p>
      </div>

      {patients.length > 0 ? (
        <div className="mb-8 grid gap-5">
          {patients.map((p) => (
            <PatientCard key={p.id} patient={p} />
          ))}
        </div>
      ) : (
        <div className="mb-8 rounded-[2rem] border border-brand-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-50 text-brand-500">
            <HeartHandshake className="h-7 w-7" />
          </div>
          <p className="font-semibold text-ink">Aún no acompañas a ningún paciente</p>
          <p className="mt-1 text-sm text-ink/60">Ingresa abajo el código que te compartió el paciente.</p>
        </div>
      )}

      <LinkPatientForm onLinked={load} />
    </PageShell>
  );
}

function PatientCard({ patient }: { patient: CaredPatient }) {
  const latest = patient.symptomLogs[0];
  const loggedToday = latest && isToday(latest.loggedDate);
  const relationship = patient.caregivers?.[0]?.relationship;
  const firstName = patient.fullName.split(' ')[0];

  return (
    <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-sm font-bold text-brand-600">
            {patient.fullName
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <p className="text-lg font-semibold text-ink">
              {patient.fullName}
              {relationship && <span className="ml-2 text-sm font-normal text-ink/50">· eres su {relationship.toLowerCase()}</span>}
            </p>
            <p className="text-sm text-ink/60">
              {patient.patientProfile?.diagnosis} ·{' '}
              {treatmentLabels[patient.patientProfile?.treatmentType || ''] || 'Tratamiento no informado'}
            </p>
          </div>
        </div>

        {loggedToday ? (
          <span
            className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-sm font-semibold ${statusMeta[latest.overallStatus].badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusMeta[latest.overallStatus].dot}`} />
            Hoy: {caregiverStatusLabel[latest.overallStatus]}
          </span>
        ) : (
          <span className="inline-flex self-start rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            Sin registro hoy
          </span>
        )}
      </div>

      {patient._count.alerts > 0 && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-coral-100 bg-coral-50 p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-coral-600" />
          <p className="text-sm text-ink/80">
            {patient._count.alerts} alerta{patient._count.alerts === 1 ? '' : 's'} activa
            {patient._count.alerts === 1 ? '' : 's'}. Su equipo médico ya fue notificado. Si {firstName} empeora, no
            esperen: contacten al equipo o acudan a urgencias.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/caregiver/patient/${patient.id}/symptoms/new`}
          className="inline-flex items-center rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          Registrar síntomas
        </Link>
        <Link
          href={`/caregiver/patient/${patient.id}`}
          className="inline-flex items-center rounded-2xl border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-brand-50"
        >
          Ver evolución y alertas
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function LinkPatientForm({ onLinked }: { onLinked: () => void }) {
  const [inviteCode, setInviteCode] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await axios.post(
        `${API_URL}/caregivers/link`,
        { inviteCode, relationship: relationship || undefined },
        { headers: authHeaders() ?? {} },
      );
      setInviteCode('');
      setRelationship('');
      setMessage({ ok: true, text: 'Listo, ya puedes acompañar a este paciente.' });
      onLinked();
    } catch (err) {
      setMessage({ ok: false, text: apiErrorMessage(err, 'No pudimos vincular el código.') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-50 text-sage-600">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-ink">Acompañar a otro paciente</p>
          <p className="text-sm text-ink/60">Ingresa el código que te compartió.</p>
        </div>
      </div>

      {message && (
        <p
          role="status"
          className={`mb-4 rounded-2xl px-4 py-3 text-sm ${message.ok ? 'bg-sage-50 text-sage-600' : 'bg-coral-50 text-coral-600'}`}
        >
          {message.text}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          aria-label="Código de invitación"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="ABCD-1234"
          required
          className="rounded-2xl border border-brand-100 bg-brand-50/40 px-4 py-3 font-mono uppercase tracking-widest text-ink outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
        />
        <input
          aria-label="Relación con el paciente"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="Relación (opcional)"
          maxLength={40}
          className="rounded-2xl border border-brand-100 bg-brand-50/40 px-4 py-3 text-ink outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {isSaving ? 'Vinculando...' : 'Vincular'}
        </button>
      </div>
    </form>
  );
}
