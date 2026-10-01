'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { clearSession } from '@/lib/api';

/** Estructura común de las páginas internas: cabecera con volver y cerrar sesión. */
export function PageShell({
  eyebrow,
  title,
  backHref,
  maxWidth = 'max-w-5xl',
  children,
}: {
  eyebrow: string;
  title: string;
  backHref: string;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className={`mx-auto flex ${maxWidth} items-center justify-between gap-4 px-6 py-5`}>
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <div>
              <p className="text-sm font-medium text-brand-600">{eyebrow}</p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-100 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-brand-200 hover:bg-brand-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <section className={`mx-auto ${maxWidth} px-6 py-8`}>
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center text-sm font-semibold text-brand-600 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver al panel
        </Link>
        {children}
      </section>
    </main>
  );
}

export function LoadingCard({ text }: { text: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream">
      <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-lg shadow-brand-100/50">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-brand-100" />
        <p className="font-medium text-ink">{text}</p>
      </div>
    </main>
  );
}
