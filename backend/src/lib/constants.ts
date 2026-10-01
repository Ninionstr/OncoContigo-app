export const ROLES = ['PATIENT', 'DOCTOR'] as const;
export type Role = (typeof ROLES)[number];

export const TREATMENT_TYPES = [
  'CHEMOTHERAPY',
  'RADIATION',
  'SURGERY',
  'IMMUNOTHERAPY',
  'HORMONE_THERAPY',
  'OTHER',
] as const;

export type OverallStatus = 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
export type AlertSeverity = 'MEDIUM' | 'HIGH' | 'CRITICAL';
