'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import {
  ShieldCheck,
  Heart,
  Thermometer,
  Activity,
  ClipboardList,
  LineChart,
  Bell,
  HeartHandshake,
  ArrowRight,
  LogOut,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Symptom {
  id: string;
  painLevel: number;
  fever: boolean;
  temperature?: number;
  nauseaLevel: number;
  fatigueLevel: number;
  appetiteLevel: number;
  overallStatus: 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  loggedDate: string;
}

// Estado general en español y con tono cuidado (nunca crudo en inglés)
const statusMeta: Record<
  Symptom['overallStatus'],
  { label: string; badge: string; dot: string }
> = {
  GOOD: { label: 'Te sientes bien', badge: 'bg-sage-50 text-sage-600', dot: 'bg-sage-500' },
  FAIR: { label: 'Día regular', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  POOR: { label: 'Día difícil', badge: 'bg-coral-50 text-coral-600', dot: 'bg-coral-500' },
  CRITICAL: {
    label: 'Conviene que te revisen',
    badge: 'bg-coral-100 text-coral-600',
    dot: 'bg-coral-600',
  },
};

export default function PatientDashboard() {
  const router = useRouter();
  const [latestSymptom, setLatestSymptom] = useState<Symptom | null>(null);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const symptomsRes = await axios.get(`${API_URL}/symptoms/patient/me?days=1`, { headers });
      if (symptomsRes.data.data.length > 0) {
        setLatestSymptom(symptomsRes.data.data[0]);
      }

      const alertsRes = await axios.get(`${API_URL}/alerts`, { headers });
      setAlerts(alertsRes.data.data);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-lg shadow-brand-100/50">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-brand-100" />
          <p className="font-medium text-ink">Cargando tu día...</p>
        </div>
      </main>
    );
  }

  const status = latestSymptom ? statusMeta[latestSymptom.overallStatus] : null;

  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <div>
              <p className="text-sm font-medium text-brand-600">Mi espacio</p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-ink">OncoContigo</h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-brand-200 hover:bg-brand-50"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        {/* Alerta: el sistema ya notificó al equipo (tranquiliza, no traslada la carga) */}
        {alerts.length > 0 && (
          <div className="mb-8 rounded-3xl border border-coral-100 bg-coral-50 p-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-coral-100 text-coral-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Tu equipo médico ya está al tanto
                </h2>
                <p className="mt-1 text-sm text-ink/70">
                  Registramos {alerts.length} alerta{alerts.length === 1 ? '' : 's'} reciente
                  {alerts.length === 1 ? '' : 's'} y la enviamos a tu equipo clínico. Si te sientes
                  peor, no esperes: contáctalos directamente.
                </p>
                <Link
                  href="/patient/alerts"
                  className="mt-3 inline-flex items-center text-sm font-semibold text-coral-600 hover:underline"
                >
                  Ver mis alertas
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Estado de hoy */}
        {latestSymptom && status ? (
          <div className="mb-8 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-ink">Cómo te sientes hoy</h2>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${status.badge}`}
              >
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Metric
                icon={<Heart className="h-5 w-5" />}
                tone="brand"
                label="Dolor"
                value={`${latestSymptom.painLevel}/10`}
              />
              <Metric
                icon={<Thermometer className="h-5 w-5" />}
                tone="coral"
                label="Fiebre"
                value={
                  latestSymptom.fever
                    ? latestSymptom.temperature
                      ? `${latestSymptom.temperature}°C`
                      : 'Sí'
                    : 'No'
                }
              />
              <Metric
                icon={<Activity className="h-5 w-5" />}
                tone="sage"
                label="Fatiga"
                value={`${latestSymptom.fatigueLevel}/10`}
              />
              <Metric
                icon={<Activity className="h-5 w-5" />}
                tone="brand"
                label="Náuseas"
                value={`${latestSymptom.nauseaLevel}/10`}
              />
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-[2rem] border border-amber-100 bg-amber-50 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-ink">Aún no registras cómo te sientes hoy</h2>
            <p className="mt-1 text-sm text-ink/70">
              Tómate un momento para tu registro diario. Es rápido y ayuda a tu equipo a cuidarte mejor.
            </p>
            <Link
              href="/patient/symptoms/new"
              className="mt-4 inline-flex items-center rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Registrar ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Accesos principales (tarjetas, sin emojis) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            href="/patient/symptoms/new"
            icon={<ClipboardList className="h-6 w-6" />}
            title="Registrar síntomas"
            desc="Tu evaluación de hoy"
            primary
          />
          <ActionCard
            href="/patient/history"
            icon={<LineChart className="h-6 w-6" />}
            title="Ver mi historial"
            desc="Cómo ha sido tu evolución"
          />
          <ActionCard
            href="/patient/alerts"
            icon={<Bell className="h-6 w-6" />}
            title="Mis alertas"
            desc={`${alerts.length} registrada${alerts.length === 1 ? '' : 's'}`}
          />
          <ActionCard
            href="/patient/caregivers"
            icon={<HeartHandshake className="h-6 w-6" />}
            title="Mis cuidadores"
            desc="Quién te acompaña"
          />
        </div>
      </section>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'brand' | 'coral' | 'sage';
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    coral: 'bg-coral-50 text-coral-600',
    sage: 'bg-sage-50 text-sage-600',
  }[tone];
  return (
    <div className="rounded-2xl border border-brand-50 bg-white p-4">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${tones}`}>
        {icon}
      </div>
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  desc,
  primary = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  primary?: boolean;
}) {
  if (primary) {
    return (
      <Link
        href={href}
        className="group flex flex-col justify-between rounded-3xl bg-brand-500 p-6 text-white shadow-sm transition hover:bg-brand-600"
      >
        <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          {icon}
        </div>
        <div>
          <p className="text-lg font-semibold">{title}</p>
          <p className="mt-1 text-sm text-white/80">{desc}</p>
        </div>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-3xl border border-brand-100 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/40"
    >
      <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <p className="text-lg font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-ink/60">{desc}</p>
      </div>
    </Link>
  );
}
