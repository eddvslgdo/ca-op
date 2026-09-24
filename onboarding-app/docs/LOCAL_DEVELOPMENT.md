# Desarrollo local aislado

## Objetivo

El frontend local nunca debe utilizar accidentalmente el proyecto Supabase conectado al despliegue de validación.

## Accesos del Corte 2

- Registro público de Lead: `http://127.0.0.1:5173/solicitud`
- Workspace SAC: `http://127.0.0.1:5173/`
- Supabase Studio: `http://127.0.0.1:54323`

El seed local crea una cuenta exclusivamente de prueba:

- Usuario: `sac.local@ca-op.test`
- Contraseña: `CaOp-Local-2026!`

Estas credenciales no deben copiarse a ambientes compartidos o productivos. El identificador
`SIM-CRM-*` sólo representa una confirmación del simulador local; nunca debe interpretarse como
un identificador emitido por el CRM corporativo.

## Requisitos

- Docker Desktop actualizado y en ejecución.
- Node.js y npm.
- Supabase CLI mediante `npx`.

## Primer arranque

Desde la raíz del repositorio:

    npx --yes supabase@latest start --exclude vector,logflare

La primera ejecución descarga imágenes grandes y puede tardar según la red. Al finalizar, la CLI muestra la URL local, la clave publicable y las URLs de Studio/Mailpit.

## Variables del frontend

Copiar `onboarding-app/.env.example` como `onboarding-app/.env.local` y reemplazar únicamente la clave local:

    VITE_APP_ENV=local
    VITE_SUPABASE_URL=http://127.0.0.1:54321
    VITE_SUPABASE_ANON_KEY=<clave publicable mostrada por supabase status>
    VITE_EMAIL_MODE=console
    VITE_CRM_MODE=simulated

`.env.local` está excluido de Git y nunca debe contener credenciales del proyecto remoto.

## Recrear la base local

    npx --yes supabase@latest db reset

El comando aplica las migraciones de `supabase/migrations` y después `supabase/seed.sql`. Solo debe utilizarse contra el stack local.

## Iniciar la aplicación

Desde `onboarding-app`:

    npm run dev

Antes de capturar datos, comprobar en las herramientas del navegador que las peticiones se dirigen a `127.0.0.1:54321`.

## Servicios locales esperados

| Servicio | Dirección predeterminada |
| --- | --- |
| API Supabase | `http://127.0.0.1:54321` |
| PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio | `http://127.0.0.1:54323` |
| Mailpit | `http://127.0.0.1:54324` |
| SMTP local | `127.0.0.1:54325` |

## Probar correos sin envío externo

La función `enviar-correo` usa Mailpit automáticamente cuando no existen
`GMAIL_USER` y `GMAIL_PASS`. Las invitaciones, correcciones, alertas y aprobaciones
se capturan en `http://127.0.0.1:54324`, donde puede revisarse el destinatario,
asunto, HTML y enlace generado. Mailpit no entrega el mensaje a Internet.

## Detener el entorno

    npx --yes supabase@latest stop

## Controles de seguridad

- Utilizar únicamente datos ficticios.
- No ejecutar `supabase link` durante el desarrollo local.
- No ejecutar `supabase db push` sin aprobación explícita.
- No guardar claves `service_role` en el frontend.
- No hacer push de `.env.local`.
- No cambiar las variables de Vercel durante las pruebas locales.
