'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SymptomForm } from '@/components/SymptomForm';
import { authHeaders } from '@/lib/api';

export default function NewSymptomPage() {
  const router = useRouter();

  useEffect(() => {
    if (!authHeaders()) router.push('/login');
  }, [router]);

  return <SymptomForm backHref="/patient/dashboard" />;
}
