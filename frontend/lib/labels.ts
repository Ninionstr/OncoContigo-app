export const treatmentLabels: Record<string, string> = {
  CHEMOTHERAPY: 'Quimioterapia',
  RADIATION: 'Radioterapia',
  SURGERY: 'Cirugía',
  IMMUNOTHERAPY: 'Inmunoterapia',
  HORMONE_THERAPY: 'Terapia hormonal',
  OTHER: 'Otro tratamiento',
};

export type OverallStatus = 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

export interface Symptom {
  id: string;
  painLevel: number;
  fever: boolean;
  temperature?: number | null;
  nauseaLevel: number;
  fatigueLevel: number;
  appetiteLevel: number;
  notes?: string | null;
  overallStatus: OverallStatus;
  loggedDate: string;
}

export interface Alert {
  id: string;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string | null;
  patient?: { id: string; fullName: string };
}

// Estado general en español y con tono cuidado (nunca crudo en inglés)
export const statusMeta: Record<OverallStatus, { label: string; badge: string; dot: string }> = {
  GOOD: { label: 'Te sientes bien', badge: 'bg-sage-50 text-sage-600', dot: 'bg-sage-500' },
  FAIR: { label: 'Día regular', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  POOR: { label: 'Día difícil', badge: 'bg-coral-50 text-coral-600', dot: 'bg-coral-500' },
  CRITICAL: {
    label: 'Conviene que te revisen',
    badge: 'bg-coral-100 text-coral-600',
    dot: 'bg-coral-600',
  },
};

// Versión clínica (para el panel médico)
export const clinicalStatusLabel: Record<OverallStatus, string> = {
  GOOD: 'Estable',
  FAIR: 'Regular',
  POOR: 'Deteriorado',
  CRITICAL: 'Crítico',
};

export const severityMeta: Record<Alert['severity'], { label: string; badge: string }> = {
  MEDIUM: { label: 'Moderada', badge: 'bg-amber-50 text-amber-700' },
  HIGH: { label: 'Alta', badge: 'bg-coral-50 text-coral-600' },
  CRITICAL: { label: 'Crítica', badge: 'bg-coral-500 text-white' },
};

export function formatDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleString('es-CL', {
    day: 'numeric',
    month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
