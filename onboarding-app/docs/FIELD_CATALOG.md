# Catálogo canónico inicial de campos

Estado: propuesta para validación con negocio y TI.

| Dominio | Campo canónico | Lead | Onboarding | Propietario final | Sensibilidad |
| --- | --- | --- | --- | --- | --- |
| Identidad | `externalLeadId` | Sí | Referencia | CA&OP | Interno |
| Identidad | `externalSessionId` | No | Sí | CA&OP | Interno |
| Identidad | `crmProspectId` | Resultado | Sí | CRM | Interno |
| Empresa | `legalName` | Sí | Sí/OCR CSF | CRM | Fiscal |
| Empresa | `taxId` | Sí | Sí/OCR CSF | CRM | Fiscal |
| Empresa | `taxRegime` | No | Sí/OCR CSF | CRM | Fiscal |
| Empresa | `cfdiUse` | No | Sí | CRM | Fiscal |
| Contacto | `contact.name` | Sí | Sí | CRM | Personal |
| Contacto | `contact.email` | Sí | Sí | CRM | Personal |
| Contacto | `contact.phone` | Sí | Sí | CRM | Personal |
| Comercial | `commercialInterest` | Sí | Referencia | CRM | Interno |
| Fiscal | `address.postalCode` | No | Sí/OCR CSF | CRM | Fiscal |
| Fiscal | `address.roadType` | No | Sí/OCR CSF | CRM | Fiscal |
| Fiscal | `address.street` | No | Sí/OCR CSF | CRM | Fiscal |
| Fiscal | `address.exteriorNumber` | No | Sí/OCR CSF | CRM | Fiscal |
| Fiscal | `address.interiorNumber` | No | Opcional/OCR CSF | CRM | Fiscal |
| Fiscal | `address.neighborhood` | No | Sí/OCR CSF | CRM | Fiscal |
| Fiscal | `address.locality` | No | Opcional/OCR CSF | CRM | Fiscal |
| Fiscal | `address.municipality` | No | Sí/OCR CSF | CRM | Fiscal |
| Fiscal | `address.state` | No | Sí/OCR CSF | CRM | Fiscal |
| Facturación | `billing.bankName` | No | Sí | CRM/SAP | Financiero |
| Facturación | `billing.bankAccountLast4` | No | Sí | CRM/SAP | Financiero |
| Facturación | `billing.paymentMethod` | No | Sí | CRM/SAP | Comercial |
| Facturación | `billing.paymentForm` | No | Sí | CRM/SAP | Comercial |
| Facturación | `billing.billingEmail` | No | Sí | CRM | Personal |
| Documento | `documents[].id` | No | Sí | Repositorio | Interno |
| Documento | `documents[].type` | No | Sí | Repositorio | Interno |
| Documento | `documents[].corporateDocumentId` | No | Tras transferencia | Repositorio | Interno |

## Campos OCR

Para cada valor extraído de la CSF se distinguirá:

- `detectedValue`: valor leído.
- `confidence`: nivel de confianza del proveedor.
- `confirmedValue`: valor corregido o confirmado por el cliente.
- `confirmedAt`: fecha/hora.
- `sourceDocumentId`: referencia a la CSF.

El valor enviado a CRM será siempre `confirmedValue`.
