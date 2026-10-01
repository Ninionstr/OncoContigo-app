'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import {
  AlertTriangle,
  Users,
  Activity,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Search,
  LogOut,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Patient {
  id: string;
  fullName: string;
  email: string;
  patientProfile?: {
    diagnosis: string;
    treatmentType: string;
  };
}

const treatmentLabels: Record<string, string> = {
  CHEMOTHERAPY: 'Quimioterapia',
  RADIATION: 'Radioterapia',
  SURGERY: 'Cirugía',
  IMMUNOTHERAPY: 'Inmunoterapia',
  HORMONE_THERAPY: 'Terapia hormonal',
  OTHER: 'Otro tratamiento',
};

export default function DoctorDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

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

      const patientsRes = await axios.get(`${API_URL}/patients`, { headers });
      setPatients(patientsRes.data.data);

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

  const filteredPatients = patients.filter((patient) => {
    const text = `${patient.fullName} ${patient.email} ${patient.patientProfile?.diagnosis ?? ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-lg shadow-brand-100/50">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-brand-100" />
          <p className="font-medium text-ink">Cargando panel clínico...</p>
          <p className="mt-1 text-sm text-ink/60">Sincronizando pacientes y alertas.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <div>
              <p className="text-sm font-medium text-brand-600">Panel clínico</p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-ink">
                OncoContigo Médico
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-coral-100 hover:bg-coral-50 hover:text-coral-600"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero en azul de marca (antes negro) */}
        <div className="mb-8 overflow-hidden rounded-[2rem] bg-brand-500 p-8 text-white shadow-xl shadow-brand-100">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
                <ShieldCheck className="h-4 w-4" />
                Monitoreo activo de pacientes
              </div>

              <h2 className="max-w-2xl text-3xl font-semibold leading-tight">
                Prioriza síntomas, alertas y evolución clínica desde un solo lugar.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80">
                Este panel resume el seguimiento reciente de tus pacientes y permite acceder
                rápidamente a sus detalles clínicos.
              </p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/20 bg-white/10 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Estado del sistema</span>
                <span className="rounded-full bg-sage-500/25 px-3 py-1 text-xs font-semibold text-sage-50">
                  Operativo
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-4/5 rounded-full bg-sage-100" />
              </div>
              <p className="text-xs text-white/70">
                Datos de pacientes y alertas sincronizados.
              </p>
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mb-8 rounded-3xl border border-coral-100 bg-coral-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-100 text-coral-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    {alerts.length} alerta{alerts.length === 1 ? '' : 's'} activa{alerts.length === 1 ? '' : 's'}
                  </h2>
                  <p className="mt-1 text-sm text-ink/70">
                    Hay pacientes que podrían requerir revisión clínica.
                  </p>
                </div>
              </div>

              <Link
                href="/doctor/alerts"
                className="inline-flex items-center justify-center rounded-2xl bg-coral-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral-600"
              >
                Ver alertas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm text-ink/60">Pacientes asignados</p>
            <p className="mt-2 text-4xl font-semibold text-ink">{patients.length}</p>
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="text-sm text-ink/60">Alertas activas</p>
            <p className="mt-2 text-4xl font-semibold text-ink">{alerts.length}</p>
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-50 text-sage-600">
              <Activity className="h-6 w-6" />
            </div>
            <p className="text-sm text-ink/60">Ventana de seguimiento</p>
            {/* TODO: reemplazar por el rango real cuando esté disponible en la API */}
            <p className="mt-2 text-4xl font-semibold text-ink">30 días</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
          <div className="border-b border-brand-50 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-brand-600">Cartera clínica</p>
                <h2 className="mt-1 text-2xl font-semibold text-ink">Mis pacientes</h2>
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o diagnóstico"
                  aria-label="Buscar pacientes"
                  className="w-full rounded-2xl border border-brand-100 bg-brand-50/40 py-3 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                />
              </div>
            </div>
          </div>

          {filteredPatients.length > 0 ? (
            <div className="divide-y divide-brand-50">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="grid gap-4 px-6 py-5 transition hover:bg-brand-50/40 lg:grid-cols-[1.1fr_1.4fr_0.9fr_0.6fr] lg:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-sm font-bold text-brand-600">
                      {patient.fullName
                        .split(' ')
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{patient.fullName}</p>
                      <p className="text-sm text-ink/60">{patient.email}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                      Diagnóstico
                    </p>
                    <p className="mt-1 text-sm text-ink/80">
                      {patient.patientProfile?.diagnosis || 'Sin diagnóstico registrado'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                      Tratamiento
                    </p>
                    <p className="mt-1 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                      {treatmentLabels[patient.patientProfile?.treatmentType || ''] ||
                        patient.patientProfile?.treatmentType ||
                        'No informado'}
                    </p>
                  </div>

                  <div className="lg:text-right">
                    <Link
                      href={`/doctor/patient/${patient.id}`}
                      className="inline-flex items-center rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                    >
                      Revisar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-50 text-brand-500">
                <Stethoscope className="h-7 w-7" />
              </div>
              <p className="font-semibold text-ink">No se encontraron pacientes</p>
              <p className="mt-1 text-sm text-ink/60">
                Intenta cambiar el filtro de búsqueda o revisa las asignaciones clínicas.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
