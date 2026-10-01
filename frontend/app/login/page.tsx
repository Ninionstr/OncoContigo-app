'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      // Nota: este decode solo sirve para decidir a dónde redirigir.
      // La autorización real la valida el backend en cada request.
      const decoded = JSON.parse(atob(res.data.accessToken.split('.')[1]));
      if (decoded.role === 'PATIENT') router.push('/patient/dashboard');
      if (decoded.role === 'DOCTOR') router.push('/doctor/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'No pudimos iniciar tu sesión. Revisa tu correo y contraseña.');
      } else {
        setError('Ocurrió un problema inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Panel izquierdo — identidad de marca */}
        <section className="relative hidden overflow-hidden bg-brand-500 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
          {/* Atmósfera suave en tonos de marca */}
          <div className="absolute -right-32 top-24 h-80 w-80 rounded-full bg-sage-500/30 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-coral-500/20 blur-3xl" />

          <div className="relative">
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
              <span className="h-2 w-2 rounded-full bg-sage-100" />
              Seguimiento clínico seguro
            </div>

            {/* Símbolo del logo + nombre */}
            <div className="mb-6 flex items-center gap-4">
              <BrandMark variant="light" className="h-14 w-14" />
              <h1 className="text-5xl font-semibold leading-tight">OncoContigo</h1>
            </div>

            <p className="mt-2 max-w-lg text-lg leading-8 text-white/85">
              Acompañamiento diario para pacientes oncológicos, con registro de síntomas,
              alertas tempranas y conexión con el equipo clínico.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-sm leading-6 text-white/90">
              “La tecnología debe sentirse cercana, no fría. OncoContigo está pensado para cuidar sin invadir.”
            </div>
          </div>
        </section>

        {/* Panel derecho — formulario */}
        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* Marca visible en móvil (cuando el panel izquierdo se oculta) */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <BrandMark className="h-11 w-11" />
              <div>
                <h1 className="text-2xl font-bold text-ink">OncoContigo</h1>
                <p className="text-sm text-ink/70">Acompañamiento durante el tratamiento.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-xl shadow-brand-100/40">
              <div className="mb-8">
                <p className="text-sm font-medium text-brand-600">Bienvenido/a</p>
                <h2 className="mt-2 text-3xl font-semibold text-ink">Inicia sesión</h2>
                <p className="mt-2 text-sm text-ink/70">
                  Accede a tu panel de seguimiento y alertas.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-coral-100 bg-coral-50 px-4 py-3 text-sm text-coral-600"
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="text-sm font-medium text-ink">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-100 bg-brand-50/40 px-4 py-3 text-ink outline-none transition placeholder:text-ink/40 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                    placeholder="tu.correo@ejemplo.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="text-sm font-medium text-ink">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-100 bg-brand-50/40 px-4 py-3 text-ink outline-none transition placeholder:text-ink/40 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:opacity-50"
                >
                  {isLoading ? 'Validando acceso...' : 'Entrar a mi panel'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-ink/70">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="font-semibold text-coral-600 hover:underline">
                  Crear cuenta
                </Link>
              </div>

              {/* Accesos de prueba — SOLO para demo/MVP. Quitar en producción. */}
              <div className="mt-8 rounded-2xl bg-brand-50/60 p-4 text-xs text-ink/70">
                <p className="font-semibold text-ink">Accesos de prueba</p>
                <p className="mt-2">Paciente: patient1@test.com / password123</p>
                <p>Doctor: doctor@test.com / password123</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
