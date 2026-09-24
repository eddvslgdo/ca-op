# Lista de verificación para entrega del MVP

## Repositorio

- [ ] Todos los cambios están agregados y confirmados en una rama de entrega.
- [ ] La rama remota contiene el mismo commit probado localmente.
- [ ] `node_modules`, `dist`, `.env.local`, `.temp` y `.branches` no están versionados.
- [ ] No existen credenciales reales, documentos de clientes ni dumps de base de datos.
- [ ] El commit de entrega tiene etiqueta o identificador registrado.

## Ejecución

- [ ] `npm ci` funciona dentro de `onboarding-app`.
- [ ] `npm run build` termina correctamente.
- [ ] `supabase start` aplica migraciones y seed desde una instalación limpia.
- [ ] El registro público, workspace SAC y portal del cliente abren en local.
- [ ] Mailpit recibe invitación, corrección y aprobación.

## Demostración funcional

- [ ] Crear Lead con datos ficticios.
- [ ] Verificar alerta de RFC/sesión duplicada.
- [ ] Simular CRM y recibir `SIM-CRM-*`.
- [ ] Promover el mismo Lead a onboarding.
- [ ] Abrir la invitación desde Mailpit.
- [ ] Completar, solicitar correcciones y reenviar.
- [ ] Aprobar y verificar auditoría.

## Aclaraciones para la audiencia

- [ ] Explicar que CA&OP no sustituye CRM, SAP ni DMS.
- [ ] Identificar claramente qué integraciones están simuladas.
- [ ] No utilizar datos personales o fiscales reales en la demostración.
- [ ] Presentar las decisiones pendientes de TI, Seguridad, Legal y negocio.

## Antes de producción

- [ ] Reemplazar credenciales y usuario local por identidad corporativa.
- [ ] Implementar backend seguro para acceso por magic link.
- [ ] Configurar SMTP corporativo y proteger la función de correo.
- [ ] Seleccionar e integrar OCR de CSF.
- [ ] Implementar conector CRM, destino documental y monitoreo.
- [ ] Corregir deuda TypeScript/ESLint y agregar pruebas automatizadas.
- [ ] Ejecutar revisión de seguridad y privacidad.

