// src/lib/equipo.js
// El equipo de Web Bonding entra con su usuario de Supabase (proyecto r4-cuentas), el mismo en /r4apertura, /leads
// y el cotizador del equipo. El rol está en public.perfiles: 'admin' y 'ventas' ven los leads, la guía de ventas y el
// cotizador del equipo; 'lectura' solo mira el panel de R4. Quien manda es la base (supabase/leads.sql): aquí el rol
// solo sirve para mostrar u ocultar.
import { supabaseR4 } from '../components/r4/r4Api';

export const ROLES_VENTAS = ['admin', 'ventas'];

export async function rolDe(sesion) {
  if (!sesion) return null;
  const { data } = await supabaseR4.from('perfiles').select('rol').eq('id', sesion.user.id).maybeSingle();
  return data?.rol ?? 'lectura';
}

// los mensajes de Supabase, en palabras del equipo
export const traducir = (err) => ({
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Signups not allowed for otp': 'Ese correo no tiene acceso.',
  'Email not confirmed': 'Ese correo todavía no está confirmado.',
  'New password should be different from the old password.': 'La nueva contraseña tiene que ser distinta de la anterior.',
}[err.message] ?? (/rate limit/i.test(err.message) ? 'Ya se enviaron varios enlaces. Espera unos minutos y vuelve a intentar.'
  : /fetch|network/i.test(err.message) ? 'No hay conexión con la base de datos.'
    : /password/i.test(err.message) ? 'Esa contraseña es muy débil: usa al menos 8 caracteres, con letras y números.'
      : err.message));
