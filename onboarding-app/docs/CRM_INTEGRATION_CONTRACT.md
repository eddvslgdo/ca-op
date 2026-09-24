# Contrato de integración CRM — Corte 1

Estado: diseño local, pendiente de validación con TI.

Versión inicial: `1.0`.

## Objetivo

CA&OP no conoce tablas ni detalles internos de CRM. Entrega contratos canónicos versionados a un conector sustituible. El transporte final puede ser REST, SOAP, middleware, cola o cualquier mecanismo aprobado por TI.

## Operaciones

### Crear Prospecto para cotización

Evento: `lead.ready`.

Condición: el cliente completó el registro mínimo y SAC lo revisó.

Resultado esperado: CRM confirma la creación y devuelve `crmProspectId`. Hasta recibirlo, CA&OP no considera al Lead listo para cotizar.

Campos:

| Campo canónico | Tipo | Obligatorio | Origen |
| --- | --- | --- | --- |
| `externalLeadId` | string | Sí | CA&OP |
| `legalName` | string | Sí | Cliente |
| `taxId` | string | Sí | Cliente |
| `contact.name` | string | Sí | Cliente |
| `contact.email` | string | Sí | Cliente |
| `contact.phone` | string | Sí | Cliente |
| `commercialInterest` | string | Sí | Cliente |
| `ownerId` | string | Por definir | SAC/CRM |
| `businessUnit` | string | Por definir | SAC |

### Actualizar Prospecto con onboarding aprobado

Evento: `customer.onboarding.approved`.

Condición: SAC aprobó el expediente y existe `crmProspectId`.

Resultado esperado: CRM actualiza el mismo Prospecto. La conversión a Cliente y el envío a SAP permanecen fuera de CA&OP.

Grupos de datos:

- Identificadores CA&OP y CRM.
- Perfil fiscal confirmado.
- Contacto confirmado.
- Facturación y pago.
- Direcciones de entrega.
- Áreas/configuración comercial.
- Referencias documentales corporativas.
- Aprobador y fecha de aprobación.

## Sobre de integración

Toda operación incluirá:

| Campo | Propósito |
| --- | --- |
| `eventId` | Identidad única del evento |
| `eventType` | Tipo de operación |
| `schemaVersion` | Versión del contrato |
| `occurredAt` | Fecha/hora UTC |
| `correlationId` | Seguimiento extremo a extremo |
| `idempotencyKey` | Prevención de duplicados |
| `payload` | Datos canónicos de la operación |

## Respuesta esperada

El conector normaliza cualquier respuesta a:

- `status`: `confirmed`, `failed`, `simulated` o `pending_configuration`.
- `correlationId`.
- `crmProspectId`, cuando corresponda.
- `crmCustomerId`, cuando corresponda.
- Código y mensaje de error sanitizados.

## Reglas técnicas

1. JSONB es un detalle de persistencia y no el contrato de CRM.
2. Ningún reintento crea un segundo Prospecto.
3. La operación se ejecuta desde backend, no desde el navegador.
4. Un HTTP exitoso no basta si falta el identificador requerido.
5. Los documentos se transmiten como referencias seguras, no como URLs públicas permanentes.
6. El payload completo solo se retiene mientras sea necesario para entrega y recuperación.
7. Después del cierre se conserva versión, resultado y huella del payload.

## Preguntas para TI

- Terminología oficial: Lead, Sospechoso, Prospecto y Cliente.
- Endpoint o mecanismo de integración.
- Autenticación y autorización.
- Campo externo usado para idempotencia.
- Catálogos y códigos válidos.
- Campos obligatorios para cotización.
- Campos obligatorios para alta completa.
- Tratamiento y destino de documentos.
- Respuesta que confirma creación o actualización.
- Reglas de reintento y límites operativos.
