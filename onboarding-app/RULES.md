# CA&OP — Reglas de negocio y flujo del MVP

## 1. Propósito y alcance

CA&OP (Customer Acquisition & Onboarding Platform) es una capa de orquestación entre el cliente, SAC y los sistemas corporativos. Digitaliza la captación y el alta de clientes sin sustituir al CRM, SAP ni al repositorio documental corporativo.

El cliente captura y confirma la información de su empresa. SAC configura los datos comerciales internos, revisa la consistencia del expediente y autoriza su transferencia. CRM mantiene el proceso comercial y SAP conserva el proceso ERP.

Principios:

- La información se captura una sola vez y se reutiliza durante el proceso.
- El cliente nunca consulta ni modifica configuración comercial interna.
- SAC revisa y solicita correcciones; no vuelve a transcribir el expediente.
- La integración se realiza únicamente mediante mecanismos aprobados por TI.
- La información sensible permanece en CA&OP solo durante el tiempo necesario.
- El estado comercial y el estado de incorporación evolucionan de forma independiente.

## 2. Actores y responsabilidades

### Cliente o prospecto

- Captura información veraz y actualizada.
- Confirma los datos capturados o sugeridos por OCR.
- Adjunta la documentación requerida.
- Atiende únicamente las correcciones solicitadas.
- Confirma y envía el expediente.

### SAC

- Comprueba la existencia previa del cliente o prospecto en CRM.
- Crea, reactiva y administra sesiones.
- Configura la información comercial interna.
- Revisa la consistencia del expediente.
- Solicita correcciones o aprueba.
- Autoriza el envío a CRM.

### Ventas

- Da seguimiento comercial dentro de CRM.
- Determina cuándo un Lead necesita sincronizarse para cotizar.
- No administra el expediente salvo que tenga un rol autorizado.

### TI y sistemas corporativos

- Definen integración, identidad, seguridad y monitoreo.
- Definen el repositorio documental definitivo.
- Mantienen la comunicación CRM–SAP.
- Aprueban las políticas de retención.

## 3. Sistemas propietarios

**RN-001 — Fuente de verdad.** Cada entidad tendrá un único sistema propietario. La existencia temporal o referencial de información en otro sistema no transfiere su propiedad.

| Entidad | Sistema propietario |
| --- | --- |
| Lead originado en CA&OP | CA&OP |
| Sesión y estado de onboarding | CA&OP |
| Avance y documentos temporales | CA&OP |
| Prospecto, cotización y oportunidad | CRM |
| Cliente y configuración comercial definitiva | CRM |
| Expediente documental definitivo | Repositorio corporativo por definir |
| Información ERP | SAP |

**RN-002 — Propósito limitado.** La información de CA&OP solo soportará captación, incorporación, validación, integración, auditoría y medición.

**RN-003 — No replicación funcional.** CA&OP no replicará funciones comerciales de CRM, funciones ERP de SAP ni conservación documental definitiva.

## 4. Captación pública y Lead

**RN-004 — Registro público.** Una empresa interesada podrá registrarse sin intervención inicial de SAC.

**RN-005 — Datos mínimos.** El formulario público solo solicitará razón social, RFC, nombre, correo y teléfono del contacto e interés comercial. No pedirá información fiscal completa, documentos, domicilios detallados ni datos bancarios.

**RN-006 — Creación de Lead.** Un formulario válido generará un Lead en CA&OP, pero no creará automáticamente un Prospecto en CRM.

**RN-007 — Permanencia.** El Lead permanecerá mientras exista finalidad comercial legítima y de acuerdo con la política de retención aprobada.

**RN-008 — Sin recaptura.** Un Lead podrá convertirse en onboarding reutilizando la información ya confirmada.

**RN-009 — Sincronización previa a cotización.** Para generar una cotización, el Lead deberá existir primero como Prospecto en CRM. Una vez que el cliente complete el registro mínimo de Lead, SAC revisará la información y ejecutará explícitamente su sincronización. Solo después de que CRM confirme la creación y devuelva el identificador del Prospecto podrá continuar la cotización dentro de CRM. Esta sincronización ocurre antes de iniciar el onboarding y no constituye un alta completa de cliente.

**RN-010 — Procesos independientes.** Sincronizar un Lead no concluye su incorporación. Lead/Sesión y Prospecto pueden coexistir porque representan responsabilidades distintas.

**RN-011 — Correlación.** CA&OP conservará la relación entre el identificador del Lead y el identificador devuelto por CRM durante el ciclo permitido.

**RN-012 — No duplicación.** Si existe un identificador CRM asociado, CA&OP nunca solicitará crear un segundo Prospecto; actualizará el existente.

## 5. Inicio del onboarding

**RN-013 — Creación autorizada.** Solo SAC u otro rol interno autorizado podrá crear una sesión de onboarding.

**RN-014 — Consulta previa.** Antes de crearla, SAC deberá comprobar que el cliente no exista como cliente completo en CRM y que no tenga otra sesión activa.

**RN-015 — Cliente existente.** Si ya existe como cliente completo, no se creará una nueva alta; se seguirá el proceso corporativo de actualización o extensión.

**RN-016 — Prospecto existente.** Un Prospecto creado por cualquier canal podrá iniciar onboarding y la sesión conservará su identificador CRM.

**RN-017 — Sesión activa única.** Solo existirá una sesión activa por cliente y proceso de alta. Una sesión existente deberá reutilizarse o reactivarse.

**RN-018 — Identidad fija.** Cada sesión pertenecerá a un único cliente y nunca podrá reasignarse.

**RN-019 — Promoción posterior a cotización.** Cuando el cliente acepte la cotización, o exista otra decisión formal de alta, SAC promoverá el Lead/Prospecto al proceso de onboarding. La sesión conservará el identificador del Prospecto ya creado en CRM. La promoción inicia la captura completa, pero no concluye el alta.

**RN-020 — Orígenes.** El onboarding podrá comenzar desde un Lead público, un Lead interno o un Prospecto existente en CRM sin expediente completo.

## 6. Configuración comercial interna

**RN-021 — Responsabilidad.** La configuración comercial será capturada exclusivamente por un rol interno autorizado.

**RN-022 — Confidencialidad.** El cliente nunca la visualizará ni modificará.

**RN-023 — Contenido.** Puede incluir unidad de negocio, organización y canal de ventas, división, oficina y grupo de vendedores, responsable, tipo/grupo de cliente, precios, condiciones de pago, Incoterms, moneda, prioridad e impuestos comerciales.

**RN-024 — Permanencia temporal.** Permanecerá asociada a la sesión mientras sea necesaria.

**RN-025 — Transferencia condicionada.** Solo se enviará a CRM después de la aprobación y autorización correspondientes.

## 7. Magic Link y acceso

**RN-026 — Enlace único.** Cada sesión tendrá un enlace exclusivo.

**RN-027 — Alta entropía.** El token será criptográficamente aleatorio, no secuencial y no predecible.

**RN-028 — Vigencia.** Tendrá vigencia inicial de tres días naturales.

**RN-029 — Vencimiento.** Al vencer, el cliente no podrá consultar ni modificar el expediente hasta una reactivación.

**RN-030 — Reactivación.** SAC podrá reactivar el acceso por tres días naturales adicionales contados desde la reactivación.

**RN-031 — Conservación.** La reactivación conservará avance, cliente y sesión.

**RN-032 — Correcciones.** El mismo enlace podrá habilitar nuevamente la sesión para atender correcciones.

**RN-033 — Protección.** El token no será identificador de negocio, no se registrará íntegro en bitácoras y se protegerá en almacenamiento.

**RN-034 — Acceso exclusivo.** El cliente solo accederá a su sesión. Esta regla se hará cumplir en backend, no solo en el navegador.

## 8. Captura y validación

**RN-035 — Formulario dinámico y orden del onboarding.** El flujo Lead solo mostrará la captura mínima. El onboarding comenzará con la carga de la Constancia de Situación Fiscal (CSF); después del análisis OCR se mostrarán las secciones del formulario con los datos fiscales precargados para revisión del cliente.

**RN-036 — Separación.** Nunca solicitará ni mostrará información comercial interna.

**RN-037 — Autoguardado.** Guardará avances y el último paso alcanzado.

**RN-038 — Reanudación.** El cliente podrá retomar el último avance mientras su acceso esté vigente.

**RN-039 — Validación previa.** Cada sección se validará antes de avanzar o enviar. En onboarding, ningún valor sugerido por OCR se considerará confirmado hasta que el cliente lo revise y acepte o modifique.

**RN-040 — Validaciones mínimas.** Incluirán obligatoriedad, tipo, formato, longitud, RFC, correo, teléfono, código postal, consistencia y archivos requeridos.

**RN-041 — Validación de servidor.** Las reglas críticas se repetirán en backend; el frontend no será el control definitivo.

**RN-042 — Declaración del cliente.** Antes de enviar, el cliente confirmará que la información es correcta y que está autorizado para proporcionarla.

**RN-043 — Bloqueo de revisión.** Después del envío no podrá modificar el expediente hasta que SAC solicite correcciones.

## 9. Documentos

**RN-044 — Formatos.** Solo se admitirán PDF, JPG y PNG, validando el contenido real.

**RN-045 — Límites configurables.** Tamaño, cantidad y obligatoriedad serán configurables.

La Constancia de Situación Fiscal será obligatoria al inicio del onboarding. El comprobante de domicilio podrá seguir formando parte del expediente cuando negocio lo requiera, pero el alcance inicial del OCR se limitará exclusivamente a la CSF.

**RN-046 — Privacidad.** Los documentos estarán en almacenamiento privado y se consultarán mediante acceso temporal autorizado.

**RN-047 — Custodia temporal.** CA&OP los conservará durante captura, revisión, transferencia y el periodo de recuperación aprobado.

**RN-048 — Destino definitivo.** El repositorio corporativo será su destino final; CA&OP no será el gestor documental.

**RN-049 — Eliminación confirmada.** Solo se depurarán tras confirmación de transferencia y cumplimiento de retención. Se conservarán referencias y auditoría mínima.

**RN-050 — Protección.** Se rechazarán archivos cuyo contenido no coincida con formatos permitidos y se preparará integración antimalware.

## 10. Revisión y correcciones

**RN-051 — Notificación.** SAC será notificado cuando el cliente envíe o reenvíe.

**RN-052 — Sin recaptura.** SAC revisará consistencia y evidencia sin transcribir nuevamente los datos.

**RN-053 — Observaciones específicas.** Cada sección rechazada tendrá una observación accionable.

**RN-054 — Corrección parcial.** El cliente solo modificará secciones observadas; las aprobadas estarán protegidas.

**RN-055 — Versionado.** Un reenvío creará una nueva versión de revisión sin borrar el historial.

**RN-056 — Aprobación condicionada.** No se aprobará con campos/documentos faltantes, observaciones abiertas o validaciones pendientes.

**RN-057 — Acción explícita.** Aprobar y enviar a CRM serán acciones explícitas, autorizadas y auditadas.

## 11. Estados y transiciones

**RN-058 — Propiedad del estado.** CA&OP administrará exclusivamente el estado de incorporación.

| Estado | Significado |
| --- | --- |
| active | Cliente en captura |
| expired | Acceso vencido |
| completed_by_client | Expediente enviado |
| under_review | Revisión de SAC |
| corrections_requested | Correcciones pendientes |
| approved | Expediente aprobado |
| integration_pending | Envío corporativo pendiente |
| integration_failed | Envío fallido y recuperable |
| integrated | CRM confirmó la operación |
| closed | Proceso operativo terminado |
| cancelled | Proceso cancelado con justificación |

**RN-059 — Transiciones controladas.** Cada cambio tendrá acción válida, actor autorizado, fecha y resultado.

Flujo normal:

    active
      ├─ vencimiento → expired ─ reactivación → active
      └─ envío → completed_by_client → under_review
                                          ├─ correcciones → corrections_requested → active
                                          └─ aprobación → approved → integration_pending
                                                                           ├─ error → integration_failed
                                                                           └─ éxito → integrated → closed

**RN-060 — Independencia comercial.** CA&OP no modificará la etapa comercial del Prospecto. Un Prospecto puede estar simultáneamente sin onboarding, en captura, en revisión o integrado.

## 12. Integración con CRM

**RN-061 — Mecanismo aprobado.** CA&OP nunca escribirá directamente en la base de datos del CRM; usará API, middleware, cola u otro mecanismo aprobado.

**RN-062 — Contratos versionados.** Existirán contratos explícitos y versionados para crear/sincronizar un Prospecto y actualizarlo con onboarding aprobado.

**RN-063 — Persistencia desacoplada.** JSONB puede utilizarse internamente, pero nunca será por sí mismo el contrato CRM. Un mapeador producirá campos identificables y documentados.

**RN-064 — Correlación.** Cada petición tendrá identificadores de evento, sesión y correlación; la respuesta conservará la referencia CRM.

**RN-065 — Idempotencia.** Un reintento no podrá crear registros duplicados.

**RN-066 — Entrega confiable.** La aprobación creará un trabajo persistente; el navegador no será responsable de completar la comunicación.

**RN-067 — Confirmación.** Solo se marcará éxito cuando el mecanismo corporativo confirme la operación y entregue la referencia esperada.

**RN-068 — Fallo recuperable.** Ante un error, se conservará el expediente y se permitirán reintentos controlados.

**RN-069 — Actualización.** Un onboarding ligado a un Prospecto actualizará el mismo registro usando su identificador.

**RN-070 — Conversión externa.** La conversión de Prospecto a Cliente será responsabilidad de CRM.

## 13. SAP

**RN-071 — Sin conexión directa.** CA&OP nunca interactuará directamente con SAP.

**RN-072 — Responsabilidad corporativa.** La transformación y comunicación CRM–SAP continuará en los sistemas corporativos.

## 14. Ciclo de vida y minimización

**RN-073 — Duplicación temporal controlada.** La información puede coexistir durante captura, revisión e integración sin convertir a CA&OP en fuente oficial del Cliente.

**RN-074 — Condición de depuración.** La minimización comenzará después de confirmar datos en CRM, documentos en su repositorio y cumplimiento del periodo de recuperación.

**RN-075 — Datos a depurar.** Tras el cierre se eliminarán o anonimizarán documentos, datos bancarios, domicilios, identificaciones y demás copias ya custodiadas por los sistemas propietarios.

**RN-076 — Referencia mínima.** CA&OP podrá conservar identificadores, estados, fechas, actor aprobador, resultado/versión de integración, huella del payload, referencias documentales y auditoría minimizada.

**RN-077 — Plazos configurables.** La retención será configurable y aprobada por TI, Seguridad, Legal y negocio.

**RN-078 — Depuración auditable.** Transferencia, eliminación y anonimización registrarán fecha, alcance y resultado sin guardar los valores eliminados.

## 15. OCR de Constancia de Situación Fiscal

**RN-079 — Alcance.** El OCR formará parte del flujo de onboarding y se aplicará únicamente a la Constancia de Situación Fiscal. No se implementará inicialmente OCR para comprobantes de domicilio ni otros documentos.

**RN-080 — Carga inicial.** Antes de capturar las secciones fiscales, el cliente adjuntará su CSF. El sistema analizará el documento y utilizará el resultado para precargar los campos distribuidos en el formulario.

**RN-081 — Campos fiscales.** El OCR intentará extraer todos los datos disponibles y relevantes de la CSF, incluidos, entre otros: RFC, razón o denominación social, régimen fiscal, código postal, tipo y nombre de vialidad, números exterior e interior, colonia, localidad, municipio o demarcación territorial y entidad federativa.

**RN-082 — Edición y responsabilidad.** Todos los valores precargados serán visibles y editables. El cliente podrá corregir cualquier error de lectura y será responsable de confirmar la versión final antes de enviar el expediente.

**RN-083 — Comparación y trazabilidad.** Se conservarán, durante el periodo operativo permitido, el valor detectado, nivel de confianza, valor finalmente confirmado, documento de origen, actor y fecha. Las diferencias entre OCR y valor confirmado deberán quedar identificables para revisión y mejora.

**RN-084 — Contingencia y proveedor desacoplado.** Si el OCR no puede leer un campo o el servicio está temporalmente indisponible, el cliente podrá capturarlo manualmente y el evento quedará registrado; el expediente no dependerá de una lectura automática perfecta. La implementación utilizará una interfaz de proveedor sustituible y aprobada por TI.

## 16. Auditoría

**RN-085 — Eventos.** Se auditarán creación/actualización de Lead, sesiones, invitaciones, vencimientos, reactivaciones, avances significativos, envíos, revisiones, correcciones, aprobación, cancelación, integraciones, transferencias y depuraciones.

**RN-086 — Contenido.** Cada evento tendrá ID, fecha/hora, actor/rol/sistema, acción, entidad afectada, resultado y correlación cuando aplique.

**RN-087 — Datos prohibidos.** La bitácora no guardará tokens completos, documentos, contraseñas, secretos ni datos personales innecesarios.

**RN-088 — Integridad.** Los usuarios operativos no podrán editar o eliminar auditoría desde la interfaz normal.

## 17. Seguridad y privacidad

**RN-089 — Autenticación interna.** Todo acceso de SAC, Ventas, revisión o administración requerirá autenticación.

**RN-090 — Autorización.** Las acciones se limitarán por rol y mínimo privilegio.

**RN-091 — Backend.** Sesiones, documentos, acciones internas e integraciones se protegerán mediante backend y políticas de base de datos.

**RN-092 — Secretos.** Claves, credenciales, destinatarios y configuración sensible no estarán escritos en el código.

**RN-093 — Correo protegido.** El servicio de correo solo aceptará solicitudes autorizadas y plantillas permitidas.

**RN-094 — Sesiones finalizadas.** Un enlace no permitirá modificar expedientes aprobados, integrados, cerrados o cancelados.

**RN-095 — Privacidad y consentimiento.** El cliente aceptará el aviso o declaración que Jurídico defina para tratamiento y transferencia.

## 18. Notificaciones

**RN-096 — Invitación/reactivación.** El cliente será notificado al crear o reactivar su acceso.

**RN-097 — Correcciones.** La notificación describirá secciones a corregir sin exponer datos sensibles.

**RN-098 — Aviso interno.** SAC será notificado tras el envío o reenvío.

**RN-099 — Fallos.** Las notificaciones fallidas serán registradas y reintentables sin alterar incorrectamente el estado.

## 19. Métricas

**RN-100 — Eventos analíticos.** Las métricas se calcularán mediante eventos y no requerirán expedientes completos.

**RN-101 — Indicadores mínimos.** Se medirán Leads y origen, sincronización CRM, conversión a onboarding, abandono por paso, tiempos de captura/revisión/integración, vencimientos, reactivaciones, correcciones, aprobación al primer intento y resultados/reintentos de integración.

**RN-102 — Minimización.** Las métricas usarán identificadores técnicos y dimensiones no sensibles siempre que sea posible.

## 20. Flujos funcionales

### A. Captación sin cotización inmediata

    Registro público → Lead en CA&OP → seguimiento → permanencia o cierre según política

### B. Lead que requiere cotización

    Registro mínimo completo → revisión SAC → sincronización del Lead
    → creación confirmada del Prospecto en CRM → almacenamiento de crmProspectId
    → cotización y seguimiento exclusivamente en CRM

### C. Lead promovido a onboarding

    Prospecto en CRM → cotización aceptada/decisión formal de alta
    → SAC inicia onboarding conservando crmProspectId
    → carga inicial de CSF → OCR → revisión y edición de campos fiscales
    → captura complementaria → revisión SAC → correcciones o aprobación
    → actualización del mismo Prospecto en CRM

### D. Prospecto existente en CRM

    Identificación → sesión ligada a crmProspectId → captura → revisión
                   → aprobación → actualización del mismo Prospecto

### E. Correcciones

    Observaciones específicas → acceso temporal → corrección de secciones rechazadas
                             → reenvío versionado → nueva revisión

### F. Integración fallida

    Aprobación → trabajo pendiente → intento
                               ├─ éxito → confirmación → retención → minimización
                               └─ fallo → conservación → reintento idempotente

## 21. Criterios para declarar funcional el MVP

1. Un registro público genera un Lead sin crear automáticamente un Prospecto; SAC debe sincronizarlo y recibir confirmación de CRM antes de cotizar.
2. SAC trabaja autenticado y con permisos.
3. No se duplican clientes, prospectos ni sesiones activas.
4. El cliente puede guardar, abandonar y retomar con acceso vigente.
5. Lead y onboarding solicitan únicamente la información correspondiente.
6. La promoción conserva datos e identificador CRM.
7. Los documentos son privados, validados y temporales; la CSF se carga al inicio del onboarding y su OCR precarga los campos fiscales editables.
8. SAC revisa, observa secciones y aprueba sin recaptura.
9. Estados y acciones son válidos y auditables.
10. Existen contratos versionados aunque el conector real siga pendiente.
11. Una simulación nunca presenta un ID aleatorio como éxito real.
12. Los reintentos son idempotentes.
13. Se distinguen aprobación, transferencia, confirmación y cierre.
14. Retención y minimización son configurables.
15. Las métricas no requieren conservar datos sensibles innecesarios.

## 22. Decisiones pendientes

Deben validarse con TI, Seguridad, Legal o negocio:

- CRM, modelo de datos y terminología oficial: Lead, Sospechoso, Prospecto y Cliente.
- Consulta de clientes/prospectos existentes.
- Mecanismo y autenticación de integración.
- Campos, catálogos y claves de idempotencia.
- Momento de conversión a Cliente.
- Repositorio documental y confirmación de transferencia.
- Límite de reactivaciones.
- Plazos de retención.
- Necesidad de OTP además del Magic Link.
- Proveedor y alcance de OCR.
- Análisis antimalware.
- Aviso de privacidad y fundamento de tratamiento.
- Roles internos y segregación de funciones.
- Canales y destinatarios oficiales de notificación.

## 23. Trazabilidad de implementación

Toda historia, cambio de código y prueba deberá indicar las reglas RN que implementa o valida. Si una necesidad contradice una regla, primero se actualizará este documento con aprobación funcional antes de cambiar la aplicación.
