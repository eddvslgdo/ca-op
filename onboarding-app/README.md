# 🚀 Portal SAC & Onboarding de Clientes - Grupo Polak (MVP)

Sistema de gestión de sesiones, generación de accesos seguros (**Magic Links**) y automatización de expedientes comerciales para prospectos y clientes de **Grupo Polak**.

---

## 📌 Descripción del Proyecto

El **Portal SAC** permite al equipo de Servicio y Atención al Cliente (SAC) y Ejecutivos de Ventas generar enlaces temporales con alta entropía (válidos por 72 horas) para que los clientes externos puedan capturar su información fiscal, bancaria y subir documentos comerciales sin necesidad de contraseñas.

El sistema administra todo el ciclo de vida del alta de cliente: desde un prospecto comercial (*Lead*) hasta la aprobación final del expediente comercial.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons, Shadcn/UI components.
* **Routing:** React Router DOM.
* **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Storage, Audit Logs).
* **Serverless / Edge Functions:** Supabase Edge Functions (Deno Runtime).
* **Servicio de Correos:** Nodemailer vía SMTP (Gmail) configurado dentro de Supabase Edge Functions.

---

## ✨ Funcionalidades Clave

1. **Gestión de Sesiones & Magic Links:**
   * Generación de tokens de alta entropía con caducidad de 72 horas.
   * Modos de flujo: **Prospecto (Lead)** u **Onboarding Completo**.
   * Promoción de sesión: Convertir un Lead existente a Onboarding Completo reutilizando los datos previamente capturados.

2. **Configuración Comercial (CRM / SAP):**
   * Asignación de Ejecutivos/Propietarios de la cuenta.
   * Parametrización de Organización de Ventas, Canales de Distribución, Incoterms, Moneda, etc.
   * Clasificación fiscal SAP (MWST IVA / ZMX1 IEPS).
   * Guardado y aplicación de **Perfiles Comerciales** reutilizables en la nube.

3. **Correos Transaccionales Automáticos:**
   * Plantillas HTML dinámicas y responsivas con bloque unificado de soporte al cliente.

4. **Bitácora de Auditoría:**
   * Registro automático en la tabla `audit_logs` para rastrear creaciones, promociones y cambios de estatus.

---

## 📂 Estructura de Archivos del Proyecto

```text
├── src/
│   ├── components/
│   │   ├── onboarding/       # Pasos del cliente (StepCompany, StepAddress, StepBilling, StepDelivery, etc.)
│   │   ├── sac/              # Modales de administración (LinkGeneratorModal, etc.)
│   │   └── ui/               # Componentes de diseño base (badge, button, card, input, label, table, etc.)
│   ├── lib/                  # Cliente de Supabase (`supabase.ts`) y utilidades (`utils.ts`)
│   ├── pages/                # Vistas principales de la aplicación
│   │   ├── CreateSessionPage.tsx # Formulario de creación/promoción de sesiones y correos
│   │   ├── OnboardingPortal.tsx  # Portal interactivo para que el cliente llene su expediente
│   │   ├── PublicLeadForm.tsx    # Formulario de registro básico para prospectos (Leads)
│   │   ├── SacWorkspace.tsx      # Tablero principal de control para el equipo SAC
│   │   ├── StepDocuments.tsx     # Carga e inspección de documentos
│   │   └── StepSummary.tsx       # Resumen final del expediente
│   ├── services/             # Lógica de servicios y conectores
│   ├── types/                # Interfaces y definición de tipos TypeScript (`onboarding.ts`)
│   ├── App.tsx               # Enrutador y layout principal
│   ├── main.tsx              # Punto de entrada de React
│   └── index.css             # Estilos globales y Tailwind CSS
├── supabase/
│   └── functions/
│       └── enviar-correo/
│           └── index.ts      # Edge Function para envío de correos con Nodemailer
└── README.md