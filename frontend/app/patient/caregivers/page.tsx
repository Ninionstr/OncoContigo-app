'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Copy, HeartHandshake, KeyRound, Trash2 } from 'lucide-react';
import { LoadingCard, PageShell } from '@/components/PageShell';
import { API_URL, apiErrorMessage, authHeaders, isUnauthorized } from '@/lib/api';
import { formatDate } from '@/lib/labels';

interface CaregiverLink {
  id: string;
  relationship: string | null;
  createdAt: string;
  caregiver: { id: string; fullName: string; email: string };
}

interface Invite {
  id: string;
  code: string;
  expiresAt: string;
}

export default function PatientCaregiversPage() {
  const router = useRouter();
  const [caregivers, setCaregivers] = useState<CaregiverLink[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/caregivers`, { headers });
      setCaregivers(res.data.data.caregivers);
      setInvites(res.data.data.invites);
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

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    setError('');
    try {
      await action();
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, fallback));
    }
  };

  const createInvite = () =>
    run(() => axios.post(`${API_URL}/caregivers/invites`, {}, { headers: authHeaders() ?? {} }), 'No pudimos generar el código.');

  const cancelInvite = (id: string) =>
    run(() => axios.delete(`${API_URL}/caregivers/invites/${id}`, { headers: authHeaders() ?? {} }), 'No pudimos anular el código.');

  const removeCaregiver = (c: CaregiverLink) => {
    if (!window.confirm(`¿Quitar el acceso de ${c.caregiver.fullName}? Ya no podrá ver tu información.`)) return;
    run(
      () => axios.delete(`${API_URL}/caregivers/${c.caregiver.id}`, { headers: authHeaders() ?? {} }),
      'No pudimos quitar el acceso.',
    );
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      // Si el navegador no permite copiar, el código sigue visible en pantalla.
    }
  };

  if (isLoading) return <LoadingCard text="Cargando tus cuidadores..." />;

  return (
    <PageShell eyebrow="Mi espacio" title="Mis cuidadores" backHref="/patient/dashboard">
      <p className="mb-6 max-w-2xl text-sm text-ink/70">
        Un cuidador o cuidadora puede ver cómo estás, tu historial y tus alertas, y registrar tus síntomas
        cuando tú no puedas. Tú decides quién tiene acceso y puedes quitarlo cuando quieras.
      </p>

      {error && (
        <div role="alert" className="mb-6 rounded-2xl border border-coral-100 bg-coral-50 px-4 py-3 text-sm text-coral-600">
          {error}
        </div>
      )}

      <section className="mb-8 overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="border-b border-brand-50 p-6">
          <h2 className="text-xl font-semibold text-ink">Quiénes te acompañan</h2>
        </div>
        {caregivers.length > 0 ? (
          <ul className="divide-y divide-brand-50">
            {caregivers.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50 text-sage-600">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">
                      {c.caregiver.fullName}
                      {c.relationship && <span className="ml-2 text-sm font-normal text-ink/50">· {c.relationship}</span>}
                    </p>
                    <p className="text-sm text-ink/60">
                      {c.caregiver.email} · desde el {formatDate(c.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeCaregiver(c)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-coral-100 hover:bg-coral-50 hover:text-coral-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Quitar acceso
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-10 text-center text-sm text-ink/60">Aún no tienes cuidadores vinculados.</p>
        )}
      </section>

      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Invitar a un cuidador</h2>
            <p className="mt-1 text-sm text-ink/60">
              Genera un código y compártelo. Sirve una sola vez y vence en 7 días. Tu cuidador lo ingresa en
              “Únete con un código” al crear su cuenta.
            </p>
          </div>
          <button
            onClick={createInvite}
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <KeyRound className="h-4 w-4" />
            Generar código
          </button>
        </div>

        {invites.length > 0 && (
          <ul className="mt-6 space-y-3">
            {invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-3 rounded-2xl bg-brand-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-2xl font-semibold tracking-widest text-ink">{inv.code}</p>
                  <p className="text-xs text-ink/50">Vence el {formatDate(inv.expiresAt, true)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copy(inv.code)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-brand-50"
                  >
                    <Copy className="h-4 w-4" />
                    {copied === inv.code ? 'Copiado' : 'Copiar'}
                  </button>
                  <button
                    onClick={() => cancelInvite(inv.id)}
                    className="rounded-2xl px-4 py-2 text-sm font-semibold text-ink/60 transition hover:text-coral-600"
                  >
                    Anular
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
