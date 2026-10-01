'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { API_URL, apiErrorMessage, authHeaders, isUnauthorized } from '@/lib/api';
import { statusMeta, type Symptom } from '@/lib/labels';

type Levels = 'painLevel' | 'nauseaLevel' | 'fatigueLevel' | 'appetiteLevel';

const scales: { key: Levels; label: string; low: string; high: string }[] = [
  { key: 'painLevel', label: 'Dolor', low: 'Sin dolor', high: 'Dolor insoportable' },
  { key: 'nauseaLevel', label: 'Náuseas', low: 'Nada', high: 'Muy intensas' },
  { key: 'fatigueLevel', label: 'Cansancio', low: 'Con energía', high: 'Agotamiento total' },
  { key: 'appetiteLevel', label: 'Apetito', low: 'Sin apetito', high: 'Apetito normal' },
];

export default function NewSymptomPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Record<Levels, number>>({
    painLevel: 0,
    nauseaLevel: 0,
    fatigueLevel: 0,
    appetiteLevel: 10,
  });
  const [fever, setFever] = useState(false);
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<(Symptom & { alerts: unknown[] }) | null>(null);

  useEffect(() => {
    if (!authHeaders()) router.push('/login');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const res = await axios.post(
        `${API_URL}/symptoms`,
        {
          ...levels,
          fever,
          temperature: fever && temperature ? Number(temperature) : null,
          notes: notes || undefined,
        },
        { headers: authHeaders() ?? {} },
      );
      setSaved(res.data.data);
    } catch (err) {
      if (isUnauthorized(err)) return router.push('/login');
      setError(apiErrorMessage(err, 'No pudimos guardar tu registro. Inténtalo de nuevo.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    const status = statusMeta[saved.overallStatus];
    return (
      <PageShell eyebrow="Registro diario" title="¡Gracias por registrarte!" backHref="/patient/dashboard">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-sage-50 text-sage-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-semibold text-ink">Tu registro quedó guardado</h2>
          <span className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${status.badge}`}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.label}
          </span>

          {saved.alerts.length > 0 && (
            <div className="mx-auto mt-6 max-w-md rounded-3xl border border-coral-100 bg-coral-50 p-5 text-left">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-coral-600" />
                <p className="text-sm text-ink/80">
                  Notamos algunos síntomas que tu equipo médico debe conocer y ya les avisamos. Si te
                  sientes peor, no esperes: contáctalos directamente o acude a urgencias.
                </p>
              </div>
            </div>
          )}

          <Link
            href="/patient/dashboard"
            className="mt-8 inline-flex rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Volver a mi espacio
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Registro diario" title="¿Cómo te sientes hoy?" backHref="/patient/dashboard">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div role="alert" className="rounded-2xl border border-coral-100 bg-coral-50 px-4 py-3 text-sm text-coral-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {scales.map((s) => (
            <div key={s.key} className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
              <div className="flex items-baseline justify-between">
                <label htmlFor={s.key} className="text-lg font-semibold text-ink">
                  {s.label}
                </label>
                <span className="text-2xl font-semibold text-brand-600">{levels[s.key]}/10</span>
              </div>
              <input
                id={s.key}
                type="range"
                min={0}
                max={10}
                value={levels[s.key]}
                onChange={(e) => setLevels({ ...levels, [s.key]: Number(e.target.value) })}
                className="mt-4 w-full accent-brand-500"
              />
              <div className="mt-1 flex justify-between text-xs text-ink/50">
                <span>{s.low}</span>
                <span>{s.high}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-ink">¿Has tenido fiebre?</p>
          <div className="mt-4 flex gap-3">
            {[false, true].map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setFever(v)}
                className={`rounded-2xl border px-5 py-2 text-sm font-semibold transition ${
                  fever === v
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-brand-100 bg-white text-ink hover:bg-brand-50'
                }`}
              >
                {v ? 'Sí' : 'No'}
              </button>
            ))}
          </div>
          {fever && (
            <div className="mt-4 max-w-xs">
              <label htmlFor="temperature" className="text-sm font-medium text-ink">
                Temperatura (°C), si la mediste
              </label>
              <input
                id="temperature"
                type="number"
                step="0.1"
                min={34}
                max={43}
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Ej: 38.2"
                className="mt-2 w-full rounded-2xl border border-brand-100 bg-brand-50/40 px-4 py-3 text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
          <label htmlFor="notes" className="text-lg font-semibold text-ink">
            ¿Algo más que quieras contarle a tu equipo?
          </label>
          <textarea
            id="notes"
            rows={3}
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional"
            className="mt-3 w-full rounded-2xl border border-brand-100 bg-brand-50/40 px-4 py-3 text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-2xl bg-brand-500 py-4 font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar mi registro'}
        </button>
      </form>
    </PageShell>
  );
}
