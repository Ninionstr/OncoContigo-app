'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LoadingCard, PageShell } from '@/components/PageShell';
import { SymptomTrend } from '@/components/SymptomTrend';
import { SymptomTable } from '@/components/SymptomTable';
import { API_URL, authHeaders, isUnauthorized } from '@/lib/api';
import { statusMeta, type Symptom } from '@/lib/labels';

const ranges = [7, 14, 30];

export default function PatientHistoryPage() {
  const router = useRouter();
  const [days, setDays] = useState(14);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }
    axios
      .get(`${API_URL}/symptoms/patient/me?days=${days}`, { headers })
      .then((res) => setSymptoms(res.data.data))
      .catch((err) => {
        console.error(err);
        if (isUnauthorized(err)) router.push('/login');
      })
      .finally(() => setIsLoading(false));
  }, [days, router]);

  if (isLoading) return <LoadingCard text="Cargando tu historial..." />;

  return (
    <PageShell eyebrow="Mi espacio" title="Mi historial" backHref="/patient/dashboard">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">Cómo ha sido tu evolución</h2>
        <div className="inline-flex rounded-2xl border border-brand-100 bg-white p-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
                days === r ? 'bg-brand-500 text-white' : 'text-ink/70 hover:bg-brand-50'
              }`}
            >
              {r} días
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <SymptomTrend symptoms={symptoms} />
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        {symptoms.length > 0 ? (
          <SymptomTable symptoms={symptoms} statusLabel={(s) => statusMeta[s.overallStatus]} />
        ) : (
          <p className="px-6 py-12 text-center text-sm text-ink/60">Aún no tienes registros en este período.</p>
        )}
      </section>
    </PageShell>
  );
}
