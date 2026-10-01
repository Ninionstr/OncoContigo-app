'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LoadingCard, PageShell } from '@/components/PageShell';
import { AlertList } from '@/components/AlertList';
import { API_URL, authHeaders, isUnauthorized } from '@/lib/api';
import type { Alert } from '@/lib/labels';

const filters = [
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'RESOLVED', label: 'Revisadas' },
  { value: 'ALL', label: 'Todas' },
];

export default function DoctorAlertsPage() {
  const router = useRouter();
  const [status, setStatus] = useState('ACTIVE');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }
    axios
      .get(`${API_URL}/alerts?status=${status}`, { headers })
      .then((res) => setAlerts(res.data.data))
      .catch((err) => {
        console.error(err);
        if (isUnauthorized(err)) router.push('/login');
      })
      .finally(() => setIsLoading(false));
  }, [status, router]);

  const resolve = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/alerts/${id}/resolve`, {}, { headers: authHeaders() ?? {} });
      setAlerts((prev) =>
        status === 'ACTIVE' ? prev.filter((a) => a.id !== id) : prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a)),
      );
    } catch (err) {
      console.error(err);
      if (isUnauthorized(err)) router.push('/login');
    }
  };

  if (isLoading) return <LoadingCard text="Cargando alertas..." />;

  return (
    <PageShell eyebrow="Panel clínico" title="Alertas" backHref="/doctor/dashboard" maxWidth="max-w-7xl">
      <div className="mb-6 inline-flex rounded-2xl border border-brand-100 bg-white p-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
              status === f.value ? 'bg-brand-500 text-white' : 'text-ink/70 hover:bg-brand-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <AlertList alerts={alerts} emptyText="No hay alertas en esta vista." showPatient onResolve={resolve} />
      </section>
    </PageShell>
  );
}
