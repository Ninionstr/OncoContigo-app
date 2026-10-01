'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LoadingCard, PageShell } from '@/components/PageShell';
import { AlertList } from '@/components/AlertList';
import { API_URL, authHeaders, isUnauthorized } from '@/lib/api';
import type { Alert } from '@/lib/labels';

export default function PatientAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }
    axios
      .get(`${API_URL}/alerts?status=ALL`, { headers })
      .then((res) => setAlerts(res.data.data))
      .catch((err) => {
        console.error(err);
        if (isUnauthorized(err)) router.push('/login');
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) return <LoadingCard text="Cargando tus alertas..." />;

  return (
    <PageShell eyebrow="Mi espacio" title="Mis alertas" backHref="/patient/dashboard">
      <p className="mb-6 max-w-2xl text-sm text-ink/70">
        Cuando un registro muestra síntomas que tu equipo debe conocer, se genera una alerta y se les
        notifica automáticamente. Si te sientes peor, no esperes: contáctalos directamente o acude a urgencias.
      </p>
      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <AlertList alerts={alerts} emptyText="No tienes alertas registradas." />
      </section>
    </PageShell>
  );
}
