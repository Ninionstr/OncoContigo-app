import { randomInt } from 'node:crypto';

// Sin caracteres ambiguos (0/O, 1/I/L) para dictarlo por teléfono sin errores.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const INVITE_TTL_DAYS = 7;

export function generateInviteCode() {
  let code = '';
  for (let i = 0; i < 8; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/** Acepta el código con o sin guion, en minúsculas o con espacios. */
export function normalizeInviteCode(raw: string) {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}
