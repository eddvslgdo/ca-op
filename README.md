# CA&OP — Customer Acquisition & Onboarding Platform

MVP para digitalizar la captación y el alta de clientes entre el cliente, SAC y los sistemas
corporativos. CA&OP funciona como capa de orquestación; no sustituye al CRM, SAP ni al repositorio
documental definitivo.

## Estado del MVP

Implementado y demostrable en local:

- registro mínimo de Lead;
- autenticación local del workspace SAC;
- sesiones y enlaces con vigencia de 72 horas;
- captura de expediente por el cliente;
- revisión, correcciones y auditoría;
- simulación idempotente de creación de Prospecto CRM (`SIM-CRM-*`);
- promoción de Lead a onboarding conservando su correlación;
- detección de sesiones duplicadas;
- correos transaccionales capturados en Mailpit;
- PostgreSQL, RLS, Storage y migraciones reproducibles con Supabase local.

Pendiente de definición o integración corporativa:

- conector real con CRM;
- comunicación CRM–SAP;
- repositorio documental definitivo;
- proveedor OCR para Constancia de Situación Fiscal;
- identidad corporativa y roles definitivos;
- SMTP corporativo, antimalware, retención y depuración aprobadas.

## Inicio rápido

Requisitos: Docker Desktop, Node.js y npm.

```powershell
npx --yes supabase@latest start
cd onboarding-app
npm install
npm run dev
```

Servicios locales:

- Aplicación: `http://127.0.0.1:5173`
- Registro público: `http://127.0.0.1:5173/solicitud`
- Supabase Studio: `http://127.0.0.1:54323`
- Mailpit: `http://127.0.0.1:54324`

Antes de iniciar el frontend, copie `onboarding-app/.env.example` como
`onboarding-app/.env.local` y use exclusivamente las credenciales publicables mostradas por
`supabase status`. Nunca coloque una clave `service_role` en el frontend.

La guía completa está en [Desarrollo local](onboarding-app/docs/LOCAL_DEVELOPMENT.md).

## Documentación

- [Reglas de negocio](onboarding-app/RULES.md)
- [Catálogo de campos](onboarding-app/docs/FIELD_CATALOG.md)
- [Contrato de integración CRM](onboarding-app/docs/CRM_INTEGRATION_CONTRACT.md)
- [Traslado y ciclo de vida de información](onboarding-app/docs/DATA_TRANSFER_AND_LIFECYCLE.md)
- [Lista de verificación para entrega](onboarding-app/docs/DELIVERY_CHECKLIST.md)

## Estructura

```text
onboarding-app/             Frontend React/Vite y documentación funcional
  src/domain/               Modelos canónicos
  src/integrations/         Contratos y conectores sustituibles
  src/repositories/         Acceso a persistencia
  src/pages/                Flujos Cliente y SAC
supabase/
  migrations/               Esquema, RLS y funciones transaccionales
  functions/enviar-correo/  Función de notificaciones
  seed.sql                  Datos exclusivamente locales
```

## Seguridad de la entrega

- `.env.local`, secretos, `node_modules`, `dist` y estado temporal de Supabase no se versionan.
- Los datos del seed son ficticios y sólo sirven para desarrollo local.
- El modo CRM local nunca representa una confirmación corporativa real.
- No ejecute `supabase link`, `db push` ni despliegues hasta validar el destino con TI.

