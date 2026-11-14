// Los avisos a los firmantes: correo (Resend o Brevo, según la clave que esté cargada) y WhatsApp (Cloud API de Meta, con
// una plantilla de autenticación aprobada). Cada correo que llega queda en el buzón del firmante, fuera de Web Bonding:
// es la copia que nadie de aquí puede cambiar. En pruebas locales (FIRMAS_LOCAL_DIR) los correos se escriben en disco.
import { env, base64, enlaceVerificar } from './entorno.ts';

type Adjunto = { nombre: string; bytes: Uint8Array; tipo?: string };
type Correo = { para: string; nombre?: string; asunto: string; html: string; texto: string; adjuntos?: Adjunto[] };

const REMITENTE = () => env('FIRMAS_REMITENTE') ?? 'Web Bonding C.A. <firmas@webbonding.net>';
const RESPONDER_A = () => env('FIRMAS_RESPONDER_A') ?? 'webbonding21@gmail.com';

export const hayCorreo = () => Boolean(env('RESEND_API_KEY') || env('BREVO_API_KEY') || env('FIRMAS_LOCAL_DIR'));
export const hayWhatsApp = () => Boolean(env('WHATSAPP_TOKEN') && env('WHATSAPP_NUMERO_ID') && env('WHATSAPP_PLANTILLA'));
export const canales = () => [...(hayCorreo() ? ['correo'] : []), ...(hayWhatsApp() ? ['whatsapp'] : [])];

export async function enviarCorreo(c: Correo) {
  if (env('FIRMAS_LOCAL_DIR')) {
    const fs = await import('node:fs/promises');
    const dir = `${env('FIRMAS_LOCAL_DIR')}/correos`;
    await fs.mkdir(dir, { recursive: true });
    const n = `${Date.now()}-${c.para.replace(/[^a-z0-9]/gi, '_')}`;
    await fs.writeFile(`${dir}/${n}.html`, `<!-- Para: ${c.para} · Asunto: ${c.asunto} -->\n${c.html}`);
    await fs.writeFile(`${dir}/${n}.txt`, `Para: ${c.para}\nAsunto: ${c.asunto}\n\n${c.texto}`);
    for (const a of c.adjuntos ?? []) await fs.writeFile(`${dir}/${n}-${a.nombre}`, a.bytes);
    return { id: n };
  }
  const resend = env('RESEND_API_KEY');
  if (resend) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${resend}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: REMITENTE(), to: [c.para], reply_to: RESPONDER_A(), subject: c.asunto, html: c.html, text: c.texto,
        attachments: (c.adjuntos ?? []).map((a) => ({ filename: a.nombre, content: base64(a.bytes) })),
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`El correo no salió (Resend ${r.status}): ${j.message ?? ''}`);
    return { id: j.id as string };
  }
  const brevo = env('BREVO_API_KEY');
  if (brevo) {
    const m = REMITENTE().match(/^(.*)<(.+)>$/);
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': brevo, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: m ? m[1].trim() : 'Web Bonding C.A.', email: m ? m[2] : REMITENTE() },
        to: [{ email: c.para, name: c.nombre }], replyTo: { email: RESPONDER_A() }, subject: c.asunto,
        htmlContent: c.html, textContent: c.texto,
        attachment: (c.adjuntos ?? []).length ? c.adjuntos!.map((a) => ({ name: a.nombre, content: base64(a.bytes) })) : undefined,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`El correo no salió (Brevo ${r.status}): ${j.message ?? ''}`);
    return { id: j.messageId as string };
  }
  throw new Error('Falta configurar el correo de las firmas (RESEND_API_KEY o BREVO_API_KEY)');
}

// el código por WhatsApp: plantilla de autenticación con el botón «Copiar código»
export async function enviarWhatsApp(telefono: string, codigo: string) {
  if (!hayWhatsApp()) throw new Error('El código por WhatsApp no está configurado');
  const para = telefono.replace(/\D/g, '').replace(/^0/, '58');
  const r = await fetch(`https://graph.facebook.com/v21.0/${env('WHATSAPP_NUMERO_ID')}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env('WHATSAPP_TOKEN')}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to: para, type: 'template',
      template: {
        name: env('WHATSAPP_PLANTILLA'), language: { code: env('WHATSAPP_IDIOMA') ?? 'es' },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: codigo }] },
          { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: codigo }] },
        ],
      },
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`El WhatsApp no salió (${r.status}): ${j.error?.message ?? ''}`);
  return { id: j.messages?.[0]?.id as string };
}

// ── Las plantillas ───────────────────────────────────────────────────────────────────────────────────────────
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

function marco(titulo: string, cuerpo: string, boton?: { texto: string; url: string }) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#F3EFE6;font-family:Arial,Helvetica,sans-serif;color:#0E0E11">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EFE6;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#0E0E11;padding:18px 24px;color:#F3EFE6;font-size:15px;font-weight:bold;letter-spacing:.02em">Web Bonding C.A. · Firma electrónica</td></tr>
<tr><td style="padding:26px 24px 8px"><h1 style="margin:0 0 14px;font-size:21px;line-height:1.3;color:#0E0E11">${titulo}</h1>
<div style="font-size:15px;line-height:1.6;color:#2b2b30">${cuerpo}</div>
${boton ? `<p style="margin:26px 0 8px"><a href="${esc(boton.url)}" style="display:inline-block;background:#2E37FF;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:10px;font-size:15px">${esc(boton.texto)}</a></p>
<p style="margin:0 0 6px;font-size:12px;color:#6b6b73;word-break:break-all">Si el botón no abre, copia este enlace: ${esc(boton.url)}</p>` : ''}
</td></tr>
<tr><td style="padding:18px 24px 24px;font-size:12px;line-height:1.5;color:#6b6b73;border-top:1px solid #eee">
Web Bonding, C.A. · RIF J-50804362-6 · 0422-057-9731<br>Este enlace es personal: no lo reenvíes. Si no esperabas este correo, respóndelo y lo revisamos.</td></tr>
</table></td></tr></table></body></html>`;
}

type Sobre = { codigo: string; titulo: string; mensaje?: string | null };
type Firmante = { nombre: string; correo: string };
const primer = (n: string) => { const p = n.trim().split(/\s+/)[0].toLowerCase(); return p.charAt(0).toUpperCase() + p.slice(1); };

export function correoInvitacion(s: Sobre, f: Firmante, url: string, documentos: string[], recordatorio = false) {
  const lista = documentos.map((d) => `<li>${esc(d)}</li>`).join('');
  const asunto = `${recordatorio ? 'Recordatorio: ' : ''}Para firmar: ${s.titulo}`;
  return {
    para: f.correo, nombre: f.nombre, asunto,
    html: marco(`${esc(primer(f.nombre))}, tienes ${documentos.length === 1 ? 'un documento' : `${documentos.length} documentos`} para firmar`,
      `<p>Web Bonding te envió <b>${esc(s.titulo)}</b> (${esc(s.codigo)}) para firmar de forma electrónica.</p>
${s.mensaje ? `<p style="background:#F3EFE6;border-radius:10px;padding:12px 14px">${esc(s.mensaje).replace(/\n/g, '<br>')}</p>` : ''}
<ul style="padding-left:20px">${lista}</ul>
<p>Desde el teléfono o la computadora: lees los documentos, escribes tu cédula, haces tu firma con el dedo o el ratón y confirmas con un código que te llega a este correo. Tarda unos tres minutos.</p>`,
      { texto: 'Revisar y firmar', url }),
    texto: `${primer(f.nombre)}, Web Bonding te envió «${s.titulo}» (${s.codigo}) para firmar de forma electrónica.\n\n${documentos.map((d) => `- ${d}`).join('\n')}\n\nRevisar y firmar: ${url}\n\nEste enlace es personal: no lo reenvíes.`,
  };
}

export function correoCodigo(s: Sobre, f: Firmante, codigo: string) {
  return {
    para: f.correo, nombre: f.nombre, asunto: `${codigo} es tu código para firmar`,
    html: marco('Tu código para firmar',
      `<p>Para firmar <b>${esc(s.titulo)}</b> escribe este código en la página de firma:</p>
<p style="font-size:34px;font-weight:bold;letter-spacing:.18em;margin:18px 0;color:#2E37FF">${codigo}</p>
<p>Vence en 10 minutos y sirve una sola vez. Nadie de Web Bonding te lo va a pedir: si no fuiste tú, no lo uses y respóndenos este correo.</p>`),
    texto: `Tu código para firmar «${s.titulo}»: ${codigo}\nVence en 10 minutos y sirve una sola vez. Si no fuiste tú, no lo uses.`,
  };
}

export function correoAcuse(s: Sobre, f: Firmante, hora: string, faltan: number, url: string) {
  return {
    para: f.correo, nombre: f.nombre, asunto: `Firmaste: ${s.titulo}`,
    html: marco('Tu firma quedó registrada',
      `<p>Firmaste <b>${esc(s.titulo)}</b> (${esc(s.codigo)}) el <b>${esc(hora)}</b>.</p>
<p>${faltan ? `Falta${faltan === 1 ? '' : 'n'} ${faltan} firma${faltan === 1 ? '' : 's'}. Cuando estén todas, te llega aquí el PDF firmado con su constancia.` : 'Ya firmaron todos: en unos minutos te llega aquí el PDF firmado con su constancia.'}</p>
<p>Guarda este correo: es tu comprobante de la firma.</p>`, { texto: 'Ver el sobre', url }),
    texto: `Firmaste «${s.titulo}» (${s.codigo}) el ${hora}. Guarda este correo: es tu comprobante.`,
  };
}

export function correoCompletado(s: Sobre, f: Firmante, final: { sha256: string; paginas: number; tsa: string; hora: string }, adjuntos: Adjunto[]) {
  return {
    para: f.correo, nombre: f.nombre, asunto: `Firmado por todos: ${s.titulo}`, adjuntos,
    html: marco('El documento quedó firmado por todos',
      `<p>Va adjunto <b>${esc(s.titulo)}</b> con las firmas de todos y la constancia de firma electrónica al final (${final.paginas} páginas). <b>Ese PDF es el original</b>: guárdalo.</p>
<p style="font-size:13px;background:#F3EFE6;border-radius:10px;padding:12px 14px;word-break:break-all">
<b>Código:</b> ${esc(s.codigo)}<br><b>Resumen SHA-256 del PDF:</b> ${final.sha256}<br>
<b>Sello de tiempo:</b> ${esc(final.tsa)}, ${esc(final.hora)} (archivo .tsr adjunto)</p>
<p>Si alguien cambia aunque sea una letra del PDF, su resumen ya no coincide. Cualquiera lo puede comprobar en ${esc(enlaceVerificar())}.</p>`,
      { texto: 'Comprobar el documento', url: enlaceVerificar() }),
    texto: `«${s.titulo}» quedó firmado por todos. El PDF adjunto es el original.\nCódigo: ${s.codigo}\nSHA-256: ${final.sha256}\nSello de tiempo: ${final.tsa}, ${final.hora}\nComprobar: ${enlaceVerificar()}`,
  };
}

export function correoAnulado(s: Sobre, f: Firmante, motivo: string) {
  return {
    para: f.correo, nombre: f.nombre, asunto: `Anulado: ${s.titulo}`,
    html: marco('Este sobre se anuló', `<p>Web Bonding anuló <b>${esc(s.titulo)}</b> (${esc(s.codigo)}). El enlace para firmar ya no sirve.</p>${motivo ? `<p>Motivo: ${esc(motivo)}</p>` : ''}`),
    texto: `Web Bonding anuló «${s.titulo}» (${s.codigo}). ${motivo ? `Motivo: ${motivo}` : ''}`,
  };
}

export function correoAlEquipo(asunto: string, texto: string) {
  return { para: RESPONDER_A(), asunto, html: marco(esc(asunto), `<p>${esc(texto).replace(/\n/g, '<br>')}</p>`), texto };
}
