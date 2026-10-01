import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate, severityMeta, type Alert } from '@/lib/labels';

export function AlertList({
  alerts,
  emptyText,
  showPatient = false,
  onResolve,
}: {
  alerts: Alert[];
  emptyText: string;
  showPatient?: boolean;
  onResolve?: (id: string) => void;
}) {
  if (alerts.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-sage-50 text-sage-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="font-semibold text-ink">{emptyText}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-brand-50">
      {alerts.map((a) => {
        const sev = severityMeta[a.severity];
        return (
          <li key={a.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
                  a.status === 'ACTIVE' ? 'bg-coral-50 text-coral-600' : 'bg-sage-50 text-sage-600'
                }`}
              >
                {a.status === 'ACTIVE' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sev.badge}`}>{sev.label}</span>
                  {showPatient && a.patient && (
                    <Link href={`/doctor/patient/${a.patient.id}`} className="text-sm font-semibold text-brand-600 hover:underline">
                      {a.patient.fullName}
                    </Link>
                  )}
                  <span className="text-xs text-ink/50">{formatDate(a.createdAt, true)}</span>
                </div>
                <p className="mt-1 text-sm text-ink/80">{a.message}</p>
                {a.status === 'RESOLVED' && <p className="mt-1 text-xs text-sage-600">Revisada por el equipo clínico</p>}
              </div>
            </div>

            {onResolve && a.status === 'ACTIVE' && (
              <button
                onClick={() => onResolve(a.id)}
                className="inline-flex items-center justify-center rounded-2xl border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-sage-500 hover:bg-sage-50 hover:text-sage-600"
              >
                Marcar como revisada
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
