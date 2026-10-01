'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { API_URL, apiErrorMessage } from '@/lib/api';

const inputClass =
  'mt-2 w-full rounded-2xl border border-brand-100 bg-brand-50/40 px-4 py-3 text-ink outline-none transition placeholder:text-ink/40 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100';

export default function CaregiverRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    inviteCode: '',
    relationship: '',
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/register-caregiver`, {
        ...form,
        relationship: form.relationship || undefined,
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      router.push('/caregiver/dashboard');
    } catch (err) {
      setError(apiErrorMessage(err, 'No pudimos crear tu cuenta. Inténtalo de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-10 text-ink">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center gap-3">
          <BrandMark className="h-11 w-11" />
          <div>
            <h1 className="text-2xl font-bold text-ink">OncoContigo</h1>
            <p className="text-sm text-ink/70">Acompañamiento durante el tratamiento.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-xl shadow-brand-100/40">
          <div className="mb-8">
            <p className="text-sm font-medium text-brand-600">Cuenta de cuidador/a</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">Acompaña a tu ser querido</h2>
            <p className="mt-2 text-sm text-ink/70">
              Pídele al paciente el código de invitación que aparece en su sección “Mis cuidadores”.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-coral-100 bg-coral-50 px-4 py-3 text-sm text-coral-600"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="inviteCode" className="text-sm font-medium text-ink">
                Código de invitación
              </label>
              <input
                id="inviteCode"
                value={form.inviteCode}
                onChange={update('inviteCode')}
                className={`${inputClass} font-mono uppercase tracking-widest`}
                placeholder="ABCD-1234"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="relationship" className="text-sm font-medium text-ink">
                Relación con el paciente <span className="font-normal text-ink/50">(opcional)</span>
              </label>
              <input id="relationship" value={form.relationship} onChange={update('relationship')} className={inputClass} placeholder="Ej: Hija, Pareja, Amigo" maxLength={40} />
            </div>

            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-ink">
                Tu nombre completo
              </label>
              <input id="fullName" autoComplete="name" value={form.fullName} onChange={update('fullName')} className={inputClass} required />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-ink">
                Correo electrónico
              </label>
              <input id="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} className={inputClass} placeholder="tu.correo@ejemplo.com" required />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-ink">
                Contraseña
              </label>
              <input id="password" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={update('password')} className={inputClass} placeholder="Mínimo 8 caracteres" required />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:opacity-50"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta de cuidador/a'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink/70">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold text-coral-600 hover:underline">
              Inicia sesión
            </Link>
            <p className="mt-2 text-xs text-ink/50">
              Si ya eres cuidador/a, puedes agregar otro paciente con su código desde tu panel.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
