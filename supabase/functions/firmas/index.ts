// Función de Supabase «firmas» (webbonding.net/firmar). Todo está en nucleo.ts; se publica con
//   supabase functions deploy firmas --project-ref nvzcfiexndqwdtwvzvph --no-verify-jwt --use-api
// (sin verificar el JWT en la entrada: los firmantes no tienen usuario; el panel se revisa adentro con el rol 'admin').
import { manejar } from './nucleo.ts';

Deno.serve(manejar);
