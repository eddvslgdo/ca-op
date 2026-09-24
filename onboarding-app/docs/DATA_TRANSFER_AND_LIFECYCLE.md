# Traslado y ciclo de vida de la información

## Objetivo

CA&OP conserva información de forma temporal para captar, validar y transferir un expediente. La
integración final debe evitar que Supabase y CRM se conviertan en dos fuentes permanentes del mismo
cliente.

## Flujo propuesto

```text
Cliente
  │ captura y confirma
  ▼
CA&OP / Supabase
  │ valida, audita y crea trabajo idempotente
  ├──────── datos canónicos ────────► CRM
  │                                   │ Prospecto / Cliente / cotización
  ├──────── documentos ─────────────► Repositorio documental
  │                                   │ referencias definitivas
  │                                   ▼
  │                              CRM ─────► SAP
  │
  └─ confirmaciones de recepción ◄────────┘
       │
       ▼
  retención temporal → minimización/depuración auditable
```

CA&OP nunca se conecta directamente a SAP. CRM o el middleware corporativo conserva esa
responsabilidad.

## Dos transferencias diferentes

### 1. Lead listo para cotización

CA&OP genera el evento versionado `lead.ready`. Envía únicamente los datos mínimos documentados en
el contrato CRM. CRM debe devolver `crmProspectId`. Sin esa confirmación no se habilita la promoción
a onboarding.

### 2. Onboarding aprobado

CA&OP genera `customer.onboarding.approved` usando el mismo `crmProspectId`. El payload contiene
campos canónicos individuales, no un JSONB opaco. Los documentos se envían al repositorio definitivo
y CRM recibe referencias corporativas, no URLs públicas permanentes.

## Entrega confiable

1. Una acción autorizada crea un registro en `integration_jobs`.
2. `idempotency_key` identifica la operación y evita duplicados.
3. Un trabajador backend envía el contrato al mecanismo aprobado por TI.
4. Cada intento queda en `integration_attempts`.
5. Sólo una confirmación válida cambia el trabajo a `confirmed`.
6. Los errores quedan como recuperables y se reintentan sin recapturar datos.

El navegador no es responsable de completar la transferencia.

## Convivencia temporal y depuración

Durante captura, revisión y recuperación puede existir una copia operativa en Supabase. Después de
confirmar datos en CRM y documentos en el repositorio corporativo se aplica el plazo de retención
aprobado. Al vencer:

- se eliminan o anonimizan documentos y datos sensibles;
- se conservan identificadores técnicos, estados, fechas y resultado de integración;
- se conserva la huella del payload, no necesariamente el payload completo;
- toda depuración genera auditoría sin reproducir el valor eliminado.

## Decisiones que TI debe cerrar

- API, middleware o cola de integración;
- autenticación máquina a máquina y rotación de secretos;
- catálogo y obligatoriedad de cada campo;
- forma de consultar Prospectos/Clientes existentes;
- respuesta que confirma alta o actualización;
- repositorio documental y mecanismo de carga;
- política de reintentos y dead-letter queue;
- plazos de retención y recuperación;
- monitoreo, alertas y responsables operativos.

## Estado actual del repositorio

El outbox, los contratos canónicos y el simulador local existen. El conector corporativo y el proceso
automático de depuración siguen pendientes de las definiciones anteriores. `SIM-CRM-*` sólo demuestra
el flujo y jamás debe enviarse a SAP o interpretarse como identificador real.

