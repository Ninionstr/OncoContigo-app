# OncoContigo

Plataforma de acompañamiento para pacientes oncológicos: registro diario de síntomas, alertas tempranas automáticas y conexión con el equipo clínico.

- **Pacientes**: registran cómo se sienten (dolor, fiebre, náuseas, cansancio, apetito), ven su evolución y sus alertas.
- **Médicos**: ven su cartera de pacientes, alertas activas priorizadas por severidad y la ficha con la evolución de cada paciente.

## Stack

| Parte | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS, lucide-react |
| Backend | Node.js, Express 5, Prisma, SQLite, JWT, Zod |

Monorepo con npm workspaces:

```
OncoContigo/
├── frontend/              # Next.js
│   ├── app/
│   │   ├── login/  register/
│   │   ├── patient/       dashboard · symptoms/new · history · alerts
│   │   └── doctor/        dashboard · alerts · patient/[id]
│   ├── components/        BrandMark, PageShell, AlertList, SymptomTrend, SymptomTable
│   └── lib/               cliente API, etiquetas y tipos
└── backend/               # API REST en /api
    ├── prisma/            schema.prisma, seed.ts (datos de demo)
    └── src/
        ├── routes/        auth, patients, symptoms, alerts
        └── lib/           auth (JWT), triage (reglas de alertas)
```

## Puesta en marcha

Requisitos: Node.js 20 o superior.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run setup      # instala dependencias, crea la base SQLite y carga datos de demo
npm run dev        # API en http://localhost:3001/api · web en http://localhost:3000
```

### Cuentas de prueba (datos de demo)

| Rol | Correo | Contraseña |
|---|---|---|
| Médico | doctor@test.com | password123 |
| Paciente | patient1@test.com | password123 |
| Paciente | patient2@test.com | password123 |
| Paciente | patient3@test.com | password123 |

Para volver a los datos de demo: `npm run db:seed -w backend`.

## API

Todas las rutas (salvo `auth`) requieren `Authorization: Bearer <accessToken>`.

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | — | Devuelve `accessToken` y `refreshToken` |
| POST | `/api/auth/register` | — | Crea una cuenta de paciente |
| POST | `/api/auth/refresh` | — | Renueva los tokens |
| GET | `/api/auth/me` | todos | Usuario actual |
| GET | `/api/patients` | médico | Pacientes asignados |
| GET | `/api/patients/:id` | médico | Ficha con registros y alertas |
| POST | `/api/symptoms` | paciente | Registra síntomas y genera alertas |
| GET | `/api/symptoms/patient/me?days=N` | paciente | Registros propios de los últimos N días |
| GET | `/api/symptoms/patient/:id?days=N` | médico | Registros de un paciente asignado |
| GET | `/api/alerts?status=ACTIVE\|RESOLVED\|ALL` | todos | Alertas (propias o de pacientes asignados) |
| PATCH | `/api/alerts/:id/resolve` | médico | Marca una alerta como revisada |

## Reglas de alertas

Definidas en [`backend/src/lib/triage.ts`](backend/src/lib/triage.ts):

| Condición | Severidad |
|---|---|
| Fiebre ≥ 38 °C | Crítica |
| Fiebre sin temperatura, o dolor ≥ 8 | Alta |
| Náuseas ≥ 8, cansancio ≥ 9, apetito ≤ 1 | Moderada |

> ⚠️ **Estos umbrales son de demostración y no están validados clínicamente.** Deben ser definidos y aprobados por el equipo médico antes de cualquier uso con pacientes reales.

## Antes de producción

- Cambiar `JWT_SECRET` y `JWT_REFRESH_SECRET` por valores largos y aleatorios.
- Quitar el bloque "Accesos de prueba" de `frontend/app/login/page.tsx` y no ejecutar el seed.
- Migrar de SQLite a PostgreSQL (cambiar `provider` en `schema.prisma` y `DATABASE_URL`).
- Revisar el cumplimiento normativo para datos de salud (en Chile, Ley 20.584 y Ley 19.628) y usar HTTPS.
- Implementar notificaciones reales al equipo clínico (correo/SMS) para alertas críticas.
