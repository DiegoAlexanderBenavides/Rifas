// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toEmail, organizadorNombre, rifaNombre, compradorNombre, compradorContacto, compradorEmail, numero } = body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const htmlEmail = `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#1a237e,#283593);padding:40px 30px;text-align:center;">
            <div style="font-size:48px;margin-bottom:10px;">🎯</div>
            <h1 style="color:#ffd700;margin:0;font-size:24px;font-weight:700;">¡Nuevo número vendido!</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Notificación de RifasApp</p>
          </div>
          <!-- Content -->
          <div style="padding:30px;">
            <p style="color:#333;font-size:16px;">Hola <strong>${organizadorNombre}</strong>,</p>
            <p style="color:#555;font-size:15px;">Te informamos que alguien acaba de reservar un número en tu rifa <strong>"${rifaNombre}"</strong>.</p>
            <!-- Número destacado -->
            <div style="background:linear-gradient(135deg,#1a237e,#283593);border-radius:12px;padding:25px;text-align:center;margin:25px 0;">
              <p style="color:rgba(255,255,255,0.7);margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Número reservado</p>
              <div style="font-size:64px;font-weight:900;color:#ffd700;line-height:1;">${String(numero).padStart(3, '0')}</div>
            </div>
            <!-- Datos del comprador -->
            <div style="background:#f8f9ff;border-radius:12px;padding:20px;margin-bottom:20px;">
              <h3 style="color:#1a237e;margin:0 0 15px;font-size:16px;">📋 Datos del comprador</h3>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#666;font-size:14px;width:40%;">👤 Nombre:</td>
                  <td style="padding:8px 0;color:#333;font-size:14px;font-weight:600;">${compradorNombre}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;font-size:14px;">📱 Contacto:</td>
                  <td style="padding:8px 0;color:#333;font-size:14px;font-weight:600;">${compradorContacto}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;font-size:14px;">📧 Email:</td>
                  <td style="padding:8px 0;color:#333;font-size:14px;font-weight:600;">${compradorEmail || 'No proporcionado'}</td>
                </tr>
              </table>
            </div>
            <p style="color:#888;font-size:13px;text-align:center;border-top:1px solid #eee;padding-top:20px;margin:0;">
              Recuerda confirmar el pago con el comprador antes de marcar el número como pagado.<br>
              <strong style="color:#1a237e;">RifasApp</strong> — Tu plataforma de rifas online
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"RifasApp 🎯" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `🎟️ Número ${String(numero).padStart(3, '0')} reservado en tu rifa "${rifaNombre}"`,
      html: htmlEmail,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error enviando email:', error);
    return NextResponse.json({ ok: false, error: 'Error al enviar el email' }, { status: 500 });
  }
}
