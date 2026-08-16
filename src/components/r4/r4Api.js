// Cliente y utilidades del panel de apertura de cuentas R4 (/r4apertura).
// Proyecto Supabase propio, distinto al del resto del sitio.
import { createClient } from '@supabase/supabase-js';

export const supabaseR4 = createClient(
  import.meta.env.VITE_R4_SUPABASE_URL,
  import.meta.env.VITE_R4_SUPABASE_ANON_KEY
);

export const BUCKET = 'recaudos';

export const ESTADOS = {
  recaudos_pendientes: { label: 'Recaudos pendientes', tono: 'ambar' },
  listo_para_enviar:   { label: 'Listo para enviar',   tono: 'cielo' },
  enviado_a_r4:        { label: 'Enviado a R4',        tono: 'indigo' },
  observado:           { label: 'Observado',           tono: 'naranja' },
  aprobado:            { label: 'Aprobado',            tono: 'verde' },
  rechazado:           { label: 'Rechazado',           tono: 'rojo' },
};

export const TIPOS = { juridica: 'Jurídica', natural: 'Natural' };

const COLUMNAS = [
  ['Nombre / Razón social', c => c.nombre],
  ['Tipo', c => TIPOS[c.tipo] ?? c.tipo],
  ['RIF', c => c.rif],
  ['Representante legal', c => c.representante],
  ['Cédula representante', c => c.cedula_representante],
  ['Teléfono', c => c.telefono],
  ['Correo', c => c.correo],
  ['Dirección', c => c.direccion],
  ['Actividad', c => c.actividad],
  ['Estado', c => ESTADOS[c.estado]?.label ?? c.estado],
  ['Documentos', c => c.documentos_cargados ?? 0],
  ['Fecha envío a R4', c => c.fecha_envio_r4],
  ['N° de cuenta', c => c.numero_cuenta],
  ['Notas', c => c.notas],
];

const celda = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

// CSV con BOM y separador ';' para que Excel en español lo abra en columnas.
export function descargarCSV(clientes) {
  const lineas = [
    COLUMNAS.map(([t]) => celda(t)).join(';'),
    ...clientes.map(c => COLUMNAS.map(([, f]) => celda(f(c))).join(';')),
  ];
  const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clientes-r4-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
