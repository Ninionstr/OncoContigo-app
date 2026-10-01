'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { LoadingCard, PageShell } from '@/components/PageShell';
import { SymptomForm } from '@/components/SymptomForm';
import { API_URL, authHeaders, isUnauthorized } from '@/lib/api';

export default function CaregiverNewSymptomPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<{ id: string; fullName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }
    axios
      .get(`${API_URL}/patients/${id}`, { headers })
      .then((res) => setPatient({ id: res.data.data.id, fullName: res.data.data.fullName }))
      .catch((err) => {
        console.error(err);
        if (isUnauthorized(err)) router.push('/login');
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) return <LoadingCard text="Preparando el registro..." />;

  if (!patient) {
    return (
      <PageShell eyebrow="Acompañando" title="Paciente" backHref="/caregiver/dashboard">
        <p className="rounded-3xl border border-brand-100 bg-white p-8 text-center text-ink/70">
          No encontramos a este paciente o ya no tienes acceso.
        </p>
      </PageShell>
    );
  }

  return <SymptomForm eyebrow="Registro como cuidador/a" backHref="/caregiver/dashboard" patient={patient} />;
}
