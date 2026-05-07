// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

// ─── Email al ORGANIZADOR ────────────────────────────────────────────────────
function htmlOrganizador(data: Record<string, string>) {
  return `<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
    <div style="background:linear-gradient(135deg,#1a237e,#283593);padding:40px 30px;text-align:center">
      <div style="font-size:48px;margin-bottom:10px">🎯</div>
      <h1 style="color:#ffd700;margin:0;font-size:22px;font-weight:700">¡Nuevo número reservado!</h1>
      <p style="color:rgba(255,255,255,.7);margin:8px 0 0;font-size:13px">Notificación de RifasApp</p>
    </div>
    <div style="padding:30px">
      <p style="color:#333;font-size:15px">Hola <strong>${data.organizadorNombre}</strong>,</p>
      <p style="color:#555;font-size:14px">Han reservado un número en tu rifa <strong>"${data.rifaNombre}"</strong>.</p>
      <div style="background:linear-gradient(135deg,#1a237e,#283593);border-radius:12px;padding:24px;text-align:center;margin:20px 0">
        <p style="color:rgba(255,255,255,.7);margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1px">Número reservado</p>
        <div style="font-size:60px;font-weight:900;color:#ffd700;line-height:1">${String(data.numero).padStart(3,'0')}</div>
      </div>
      <div style="background:#f8f9ff;border-radius:12px;padding:18px;margin-bottom:20px">
        <h3 style="color:#1a237e;margin:0 0 12px;font-size:15px">📋 Datos del comprador</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#666;font-size:13px;width:40%">👤 Nombre:</td><td style="color:#333;font-size:13px;font-weight:600">${data.compradorNombre}</td></tr>
          <tr><td style="padding:6px 0;color:#666;font-size:13px">📱 Contacto:</td><td style="color:#333;font-size:13px;font-weight:600">${data.compradorContacto}</td></tr>
          <tr><td style="padding:6px 0;color:#666;font-size:13px">📧 Email:</td><td style="color:#333;font-size:13px;font-weight:600">${data.compradorEmail || 'No indicado'}</td></tr>
        </table>
      </div>
      <p style="color:#888;font-size:12px;text-align:center;border-top:1px solid #eee;padding-top:16px;margin:0">Confirma el pago con el comprador para enviarle su boleto oficial.<br><strong style="color:#1a237e">RifasApp</strong></p>
    </div>
  </div></body></html>`;
}

// ─── Email al COMPRADOR (confirmación de reserva) ────────────────────────────
function htmlCompradorReserva(data: Record<string, string>) {
  const waLink = data.telefonoOrganizador
    ? `https://wa.me/${data.telefonoOrganizador.replace(/\D/g,'')}?text=Hola%2C+soy+${encodeURIComponent(data.compradorNombre)}+y+reserv%C3%A9+el+n%C3%BAmero+${data.numero}+en+tu+rifa+"${encodeURIComponent(data.rifaNombre)}".+%C2%BFC%C3%B3mo+confirmo+el+pago%3F`
    : null;

  return `<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
    <div style="background:linear-gradient(135deg,#1a237e,#283593);padding:40px 30px;text-align:center">
      <div style="font-size:48px;margin-bottom:10px">🎉</div>
      <h1 style="color:#ffd700;margin:0;font-size:22px;font-weight:700">¡Reserva confirmada!</h1>
      <p style="color:rgba(255,255,255,.7);margin:8px 0 0;font-size:13px">RifasApp</p>
    </div>
    <div style="padding:30px">
      <p style="color:#333;font-size:15px">Hola <strong>${data.compradorNombre}</strong>,</p>
      <p style="color:#555;font-size:14px">Has reservado exitosamente el número en la rifa <strong>"${data.rifaNombre}"</strong>. ¡Ya casi tienes tu boleto!</p>
      <div style="background:linear-gradient(135deg,#1a237e,#283593);border-radius:12px;padding:24px;text-align:center;margin:20px 0">
        <p style="color:rgba(255,255,255,.7);margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1px">Tu número reservado</p>
        <div style="font-size:64px;font-weight:900;color:#ffd700;line-height:1">${String(data.numero).padStart(3,'0')}</div>
        <p style="color:rgba(255,255,255,.8);margin:10px 0 0;font-size:14px">🏆 Premio: ${data.premio}</p>
        <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:13px">💰 Valor: $${Number(data.precio).toLocaleString('es-CO')} COP</p>
      </div>
      <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:12px;padding:18px;margin:16px 0">
        <h3 style="color:#f57f17;margin:0 0 10px;font-size:14px">⏳ Próximo paso: Confirmar tu pago</h3>
        <p style="color:#555;font-size:13px;margin:0">Tu número está <strong>reservado</strong> pero aún no confirmado. Debes realizar el pago al organizador para asegurar tu participación y recibir tu boleto oficial.</p>
      </div>
      ${waLink ? `<div style="text-align:center;margin:20px 0"><a href="${waLink}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px">💬 Confirmar pago por WhatsApp</a><p style="color:#888;font-size:12px;margin:8px 0 0">Contactar a: ${data.organizadorNombre}</p></div>` : `<div style="background:#f8f9ff;border-radius:10px;padding:14px;margin:16px 0;text-align:center"><p style="color:#555;font-size:13px;margin:0">Contacta al organizador para confirmar tu pago:<br><strong>${data.organizadorNombre}</strong> • ${data.compradorContacto}</p></div>`}
      <p style="color:#aaa;font-size:11px;text-align:center;border-top:1px solid #eee;padding-top:16px;margin:0">Una vez confirmado tu pago, recibirás tu boleto oficial por este correo.<br><strong style="color:#1a237e">RifasApp</strong></p>
    </div>
  </div></body></html>`;
}

// ─── BOLETO OFICIAL (cuando el organizador confirma el pago) ─────────────────
function htmlBoleto(data: Record<string, string>) {
  const color = data.colorPrimario || '#1a237e';
  const acento = data.colorAcento || '#ffd700';
  const boletoId = `RF-${data.rifaId?.slice(-6).toUpperCase()}-${String(data.numero).padStart(3,'0')}`;

  return `<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#f0f0f0;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:30px auto">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,${color},${acento});border-radius:20px 20px 0 0;padding:40px 30px;text-align:center;position:relative">
      <div style="font-size:56px;margin-bottom:8px">${data.emoji || '🎯'}</div>
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:900;text-shadow:0 2px 8px rgba(0,0,0,.3)">${data.rifaNombre}</h1>
      <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px">🏆 Premio: ${data.premio}</p>
    </div>

    <!-- Boleto body -->
    <div style="background:#1a1a2e;padding:0">
      <!-- Línea punteada separadora -->
      <div style="border-top:3px dashed rgba(255,255,255,.15);margin:0 20px;position:relative">
        <div style="position:absolute;left:-30px;top:-14px;width:28px;height:28px;background:#f0f0f0;border-radius:50%"></div>
        <div style="position:absolute;right:-30px;top:-14px;width:28px;height:28px;background:#f0f0f0;border-radius:50%"></div>
      </div>

      <!-- Número -->
      <div style="text-align:center;padding:30px 20px 20px">
        <p style="color:rgba(255,255,255,.5);margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:2px">Tu número de la suerte</p>
        <div style="font-size:80px;font-weight:900;color:${acento};line-height:1;text-shadow:0 0 30px rgba(255,215,0,.4)">${String(data.numero).padStart(3,'0')}</div>
      </div>

      <!-- Info del comprador -->
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;margin:0 20px 20px;padding:18px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;color:rgba(255,255,255,.5);font-size:12px;width:45%">👤 Titular</td>
            <td style="color:#fff;font-size:13px;font-weight:700">${data.compradorNombre}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:rgba(255,255,255,.5);font-size:12px">📱 Contacto</td>
            <td style="color:#fff;font-size:13px;font-weight:700">${data.compradorContacto}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:rgba(255,255,255,.5);font-size:12px">📅 Válido hasta</td>
            <td style="color:#fff;font-size:13px;font-weight:700">${data.fechaLimite}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:rgba(255,255,255,.5);font-size:12px">💰 Pagado</td>
            <td style="color:#00e676;font-size:13px;font-weight:700">✅ Confirmado</td>
          </tr>
        </table>
      </div>

      <!-- ID del boleto -->
      <div style="text-align:center;padding:0 20px 20px">
        <div style="background:rgba(255,255,255,.06);border:1px dashed rgba(255,255,255,.15);border-radius:8px;padding:12px;display:inline-block">
          <p style="color:rgba(255,255,255,.4);margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1px">ID del boleto</p>
          <p style="color:#fff;margin:0;font-size:16px;font-weight:800;font-family:monospace;letter-spacing:3px">${boletoId}</p>
        </div>
      </div>

      <!-- PAGADO stamp -->
      <div style="text-align:center;padding:0 20px 20px">
        <div style="display:inline-block;border:3px solid #00e676;border-radius:8px;padding:8px 24px;transform:rotate(-5deg)">
          <p style="color:#00e676;margin:0;font-size:20px;font-weight:900;letter-spacing:4px">✅ PAGADO</p>
        </div>
      </div>

      <!-- Footer línea punteada -->
      <div style="border-top:3px dashed rgba(255,255,255,.15);margin:0 20px;position:relative">
        <div style="position:absolute;left:-30px;top:-14px;width:28px;height:28px;background:#f0f0f0;border-radius:50%"></div>
        <div style="position:absolute;right:-30px;top:-14px;width:28px;height:28px;background:#f0f0f0;border-radius:50%"></div>
      </div>

      <div style="text-align:center;padding:20px">
        <p style="color:rgba(255,255,255,.35);font-size:11px;margin:0">Organizado por <strong style="color:rgba(255,255,255,.6)">${data.organizadorNombre}</strong> • RifasApp</p>
        <p style="color:rgba(255,255,255,.2);font-size:10px;margin:4px 0 0">Guarda este boleto como comprobante de tu participación</p>
      </div>
    </div>
  </div></body></html>`;
}

// ─── ROUTE HANDLER ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipo, ...data } = body;

    let subject = '';
    let html = '';
    let toEmail = '';

    if (tipo === 'organizador') {
      toEmail = data.toEmail;
      subject = `🎟️ Número ${String(data.numero).padStart(3,'0')} reservado en "${data.rifaNombre}"`;
      html = htmlOrganizador(data);
    } else if (tipo === 'comprador') {
      toEmail = data.compradorEmail;
      subject = `🎉 ¡Reservaste el número ${String(data.numero).padStart(3,'0')} en "${data.rifaNombre}"!`;
      html = htmlCompradorReserva(data);
    } else if (tipo === 'boleto') {
      toEmail = data.compradorEmail;
      subject = `🎫 Tu boleto oficial — Número ${String(data.numero).padStart(3,'0')} — "${data.rifaNombre}"`;
      html = htmlBoleto(data);
    } else {
      return NextResponse.json({ ok: false, error: 'Tipo de email desconocido' }, { status: 400 });
    }

    if (!toEmail) return NextResponse.json({ ok: false, error: 'Email destinatario vacío' }, { status: 400 });

    await transporter.sendMail({
      from: `"RifasApp 🎯" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error enviando email:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
