# Firma electrónica (webbonding.net/firmar)

Cada firmante recibe un enlace personal por correo y firma en cinco pasos: lee los PDF, escribe su cédula, dibuja su firma,
pide un código de un solo uso (correo o WhatsApp) y acepta. Al firmar el último, la función arma **un PDF firmado**: los
documentos tal cual, una línea arriba en cada página y la **Constancia de firma electrónica** al final. Ese PDF lleva un
**sello de tiempo RFC 3161** (DigiCert; si no responde, FreeTSA) y llega a todos por correo con el sello (.tsr) y su resumen
SHA-256. Cualquiera lo comprueba en `/firmar/verificar`.

| Pieza | Dónde |
| --- | --- |
| Tablas, bitácora encadenada, bucket privado | `supabase/firmas.sql` |
| Función (Deno) | `supabase/functions/firmas/` (`nucleo.ts` es todo; `pdf.ts` la constancia; `sello.ts` el RFC 3161; `avisos.ts` correos y WhatsApp) |
| Página del firmante y de comprobar | `src/pages/Firmar.jsx` |
| Panel | `/admin/contratos` (`src/components/admin/Contratos.jsx`), solo rol `admin` |

## Cómo cumple el Decreto-Ley sobre Mensajes de Datos y Firmas Electrónicas

- **Art. 16, vinculada al firmante y bajo su control:** enlace propio, cédula escrita por él, código de 6 números a su correo
  (vence en 10 min, una sola vez, 5 intentos, 3 por hora), IP, navegador y hora del servidor.
- **Art. 16, detecta cambios:** SHA-256 de cada PDF al subirlo, del PDF firmado y sello de tiempo de un tercero; cada evento de
  la bitácora lleva el resumen del anterior y la base no deja cambiarlos ni borrarlos.
- **Art. 17:** sin certificado de un proveedor acreditado ante SUSCERTE vale por sana crítica; por eso el contrato trae la
  cláusula donde las partes la reconocen como su firma. Lo que la hace fuerte frente a «Web Bonding la cambió»: el correo con
  el PDF y su resumen queda en el buzón de cada firmante, y el sello lo da DigiCert, no nosotros.

## Ponerla en marcha (una vez)

1. **SQL:** aplicar `supabase/firmas.sql` en el proyecto `nvzcfiexndqwdtwvzvph` (API de administración o SQL Editor). Se puede
   correr dos veces sin romper nada.
2. **Correo** (sin esto no salen enlaces ni códigos). Recomendado **Resend** (3.000 correos al mes gratis):
   cuenta en resend.com → Domains → `webbonding.net` → poner los registros DNS que pide → API Keys → crear una.
   Alternativa sin DNS: **Brevo** (300 al día) con el remitente verificado.
3. **Secretos de la función** (Supabase → Edge Functions → Secrets, o `supabase secrets set`):
   - `RESEND_API_KEY` (o `BREVO_API_KEY`)
   - `FIRMAS_REMITENTE` = `Web Bonding C.A. <firmas@webbonding.net>` (con Brevo, el correo verificado)
   - opcionales: `FIRMAS_RESPONDER_A` (por defecto webbonding21@gmail.com), `FIRMAS_SITIO` (por defecto https://webbonding.net)
   - WhatsApp, cuando haya plantilla de autenticación aprobada en Meta: `WHATSAPP_TOKEN`, `WHATSAPP_NUMERO_ID`,
     `WHATSAPP_PLANTILLA` (y `WHATSAPP_IDIOMA`, por defecto `es`). Sin ellos, el código va solo por correo.
4. **Publicar la función:**
   ```bash
   SUPABASE_ACCESS_TOKEN=… supabase functions deploy firmas --project-ref nvzcfiexndqwdtwvzvph --no-verify-jwt --use-api
   ```
   `--no-verify-jwt` porque los firmantes no tienen usuario; lo del panel se revisa adentro con `public.perfiles.rol = 'admin'`.
5. **La web:** push a main (Render publica `/firmar` y `/admin/contratos`). No hace falta ninguna variable nueva en Render.

## Probarla en esta Mac sin tocar Supabase

La función corre en Node con un Postgres local (`FIRMAS_LOCAL_DIR` guarda los PDF y los correos en disco, y acepta el
token `demo-admin` para el panel). La web apunta a ella con `VITE_FIRMAS_URL=http://localhost:8787` y se entra a
`/admin/contratos?demo`.

## Comprobar un PDF firmado a mano

```bash
shasum -a 256 "archivo firmado.pdf"                        # el mismo resumen que dice el correo y la constancia
openssl ts -reply -in "archivo firmado.tsr" -text          # la hora del sello
openssl ts -verify -data "archivo firmado.pdf" -in "archivo firmado.tsr" -CAfile /etc/ssl/cert.pem   # Verification: OK
```
