import type { AlertSeverity, OverallStatus } from './constants.js';

export interface SymptomInput {
  painLevel: number;
  fever: boolean;
  temperature?: number | null;
  nauseaLevel: number;
  fatigueLevel: number;
  appetiteLevel: number;
}

export interface TriageAlert {
  severity: AlertSeverity;
  message: string;
}

/**
 * Reglas de triage del MVP.
 * IMPORTANTE: umbrales de demostración, NO validados clínicamente.
 * Deben ser definidos y aprobados por el equipo médico antes de uso real.
 */
export function triage(s: SymptomInput): { overallStatus: OverallStatus; alerts: TriageAlert[] } {
  const alerts: TriageAlert[] = [];

  if (s.fever && (s.temperature ?? 0) >= 38) {
    alerts.push({
      severity: 'CRITICAL',
      message: `Fiebre de ${s.temperature}°C durante el tratamiento. Evaluar posible neutropenia febril.`,
    });
  } else if (s.fever) {
    alerts.push({ severity: 'HIGH', message: 'Paciente reporta fiebre.' });
  }

  if (s.painLevel >= 8) {
    alerts.push({ severity: 'HIGH', message: `Dolor intenso reportado (${s.painLevel}/10).` });
  }
  if (s.nauseaLevel >= 8) {
    alerts.push({ severity: 'MEDIUM', message: `Náuseas intensas (${s.nauseaLevel}/10).` });
  }
  if (s.fatigueLevel >= 9) {
    alerts.push({ severity: 'MEDIUM', message: `Fatiga severa (${s.fatigueLevel}/10).` });
  }
  if (s.appetiteLevel <= 1) {
    alerts.push({ severity: 'MEDIUM', message: `Apetito muy bajo (${s.appetiteLevel}/10).` });
  }

  let overallStatus: OverallStatus = 'GOOD';
  if (alerts.some((a) => a.severity === 'CRITICAL')) overallStatus = 'CRITICAL';
  else if (alerts.some((a) => a.severity === 'HIGH')) overallStatus = 'POOR';
  else if (
    alerts.length > 0 ||
    Math.max(s.painLevel, s.nauseaLevel, s.fatigueLevel) >= 5 ||
    s.appetiteLevel <= 3
  ) {
    overallStatus = 'FAIR';
  }

  return { overallStatus, alerts };
}
