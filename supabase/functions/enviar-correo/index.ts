import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import nodemailer from "npm:nodemailer@6.9.7"

// Configuración de seguridad (CORS) para permitir que tu web se conecte
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de la petición pre-vuelo (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { tipo, destinatario, datos } = body

    // 1. Configuramos Nodemailer con tu Gmail (Las credenciales las pondremos en las variables de entorno de Supabase)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('GMAIL_USER'), // Ej: notificaciones@grupopolak.com
        pass: Deno.env.get('GMAIL_PASS')  // La contraseña de 16 letras del Paso 1
      }
    })

    let asunto = ""
    let html = ""

    // 2. Seleccionamos la plantilla según la acción
    switch (tipo) {
      case 'lead_invite':
        asunto = "Invitación de Registro - Grupo Polak"
        html = `
          <div style="font-family: Arial, sans-serif; color: #333; max-w-[600px] margin: 0 auto;">
            <h2 style="color: #4f46e5;">¡Hola, ${datos.razonSocial}!</h2>
            <p>Gracias por tu interés. <strong>Grupo Polak</strong> te ha invitado a registrarte en nuestro portal de prospectos.</p>
            <p>Para iniciar, por favor haz clic en el siguiente enlace seguro:</p>
            <a href="${datos.magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Acceder al Portal</a>
            <p style="font-size: 12px; color: #666;">(Este enlace es único y expira en 72 horas).</p>
          </div>
        `
        break;

      case 'onboarding_invite':
        asunto = "Continúa tu proceso de registro - Familia Grupo Polak"
        html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #10b981;">¡Hola, ${datos.razonSocial}!</h2>
            <p>Gracias por tu interés en formar parte de la familia Grupo Polak.</p>
            <p>Para continuar tu proceso de registro de alta de cliente, es importante que accedas al siguiente enlace para completar tus datos fiscales, bancarios y adjuntar tus documentos legales.</p>
            <a href="${datos.magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Completar mi Expediente</a>
            <p style="font-size: 12px; color: #666;">(Este enlace es único y expira en 72 horas).</p>
          </div>
        `
        break;

      case 'corrections':
        asunto = "Acción Requerida: Actualización de tu expediente - Grupo Polak"
        // Convertimos el mapa de notas en una lista de viñetas
        const listaErrores = Object.entries(datos.notasMap).map(([sec, nota]) => `<li><strong>${sec}:</strong> ${nota}</li>`).join('')
        html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #f59e0b;">Acción Requerida</h2>
            <p>Hola <strong>${datos.razonSocial}</strong>. Hemos revisado tu expediente y nuestro equipo de validación necesita que corrijas o actualices los siguientes detalles antes de poder darte de alta:</p>
            <ul>${listaErrores}</ul>
            <p>Haz clic aquí para retomar tu registro y solucionar estos detalles:</p>
            <a href="${datos.magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Corregir mi Expediente</a>
          </div>
        `
        break;

      case 'approved':
        asunto = "¡Bienvenido a Grupo Polak! - Expediente Aprobado"
        html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #10b981;">¡Felicidades!</h2>
            <p>Tu expediente comercial ha sido validado con éxito.</p>
            <p>Tu número de cliente asignado es: <strong style="font-size: 18px; color: #047857;">${datos.crmId}</strong></p>
            <p><strong>¡Bienvenido a Grupo Polak!</strong> A partir de este momento, cualquier situación, cotización o seguimiento lo podrás ver directamente con tu ejecutivo de ventas asignado (<strong>${datos.propietario}</strong>).</p>
            <p>Gracias por tu confianza.</p>
          </div>
        `
        break;

      case 'sac_alert':
        asunto = `🔔 Actualización de Expediente: ${datos.razonSocial}`
        html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #4f46e5;">Nuevo Movimiento en SAC</h2>
            <p>Hola, equipo. El sistema ha registrado un nuevo movimiento:</p>
            <ul>
              <li><strong>Cliente:</strong> ${datos.razonSocial}</li>
              <li><strong>ID Sesión:</strong> ${datos.sessionId}</li>
              <li><strong>Ejecutivo:</strong> ${datos.propietario}</li>
            </ul>
            <div style="padding: 15px; background-color: #f8fafc; border-left: 4px solid #4f46e5; margin: 20px 0;">
              <strong>Acción:</strong> ${datos.mensajeAlerta}
            </div>
            <p>Ingresa al Portal SAC para revisarlo.</p>
          </div>
        `
        break;

      default:
        throw new Error("Tipo de correo no válido")
    }

    // 3. Enviamos el correo
    await transporter.sendMail({
      from: `"Portal SAC Polak" <${Deno.env.get('GMAIL_USER')}>`,
      to: destinatario,
      subject: asunto,
      html: html
    })

    return new Response(JSON.stringify({ success: true, message: "Correo enviado" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error enviando correo:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})