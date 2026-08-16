/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiSearch, FiDownload, FiChevronRight, FiUsers, FiPaperclip } from 'react-icons/fi';
import { supabaseR4, ESTADOS, TIPOS, descargarCSV } from './r4Api';
import R4Form from './R4Form';

export default function R4Lista({ soloLectura, onOpen }) {
  const [filas, setFilas] = useState([]);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [form, setForm] = useState(null);      // null | {} para nuevo
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const { data } = await supabaseR4
      .from('clientes_avance').select('*').order('created_at', { ascending: false });
    setFilas(data ?? []);
    setCargando(false);
  }
  useEffect(() => { cargar(); }, []);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return filas.filter(f =>
      (!estado || f.estado === estado) &&
      (!t || [f.nombre, f.rif, f.representante, f.correo].some(v => (v ?? '').toLowerCase().includes(t))));
  }, [filas, q, estado]);

  const total = filas.length;
  const conDocs = filas.filter(f => f.documentos_cargados > 0).length;
  const enviados = filas.filter(f => ['enviado_a_r4', 'aprobado'].includes(f.estado)).length;
  const abiertas = filas.filter(f => f.estado === 'aprobado').length;

  return (
    <>
      <div className="r4-herramientas">
        <div className="r4-buscador">
          <FiSearch size={16} />
          <input className="r4-campo" placeholder="Buscar por nombre, RIF, representante…"
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="r4-campo" value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="r4-btn r4-btn-plano r4-btn-icono" onClick={() => descargarCSV(visibles)}
                title="Exportar lista para R4" aria-label="Exportar lista para R4">
          <FiDownload size={16} />
        </button>
        {!soloLectura && (
          <button className="r4-btn r4-btn-primario" onClick={() => setForm({})}>
            <FiPlus size={16} /> Cliente
          </button>
        )}
      </div>

      <div className="r4-resumen">
        {[['Clientes', total], ['Con documentos', conDocs],
          ['Enviados a R4', enviados], ['Cuentas abiertas', abiertas]].map(([k, v]) => (
          <div className="r4-tarjeta" key={k}><b>{v}</b><span>{k}</span></div>
        ))}
      </div>

      <div className="r4-tarjeta r4-lista">
        {cargando && <p className="r4-cargando">Cargando…</p>}
        {!cargando && visibles.length === 0 && (
          <div className="r4-vacio">
            <FiUsers size={22} />
            Sin clientes que coincidan.
          </div>
        )}
        {visibles.map(c => {
          const est = ESTADOS[c.estado] ?? {};
          return (
            <button key={c.id} className="r4-fila" onClick={() => onOpen(c.id)}>
              <span className="r4-fila-datos">
                <strong>{c.nombre}</strong>
                <span>
                  {c.rif} · {TIPOS[c.tipo]}{c.representante ? ` · ${c.representante}` : ''}
                </span>
              </span>
              <span className={`r4-chip ${c.documentos_cargados > 0 ? 'r4-chip-marca' : 'r4-chip-neutro'}`}>
                <FiPaperclip size={13} /> {c.documentos_cargados}
              </span>
              <span className={`r4-chip r4-chip-${est.tono ?? 'neutro'}`}>{est.label ?? c.estado}</span>
              <FiChevronRight size={16} color="#77767a" />
            </button>
          );
        })}
      </div>

      {/* Al crear uno nuevo abrimos su ficha: ahí es donde se cargan los documentos. */}
      {form && (
        <R4Form cliente={form} onClose={() => setForm(null)}
                onSaved={(id, esNuevo) => { setForm(null); esNuevo ? onOpen(id) : cargar(); }} />
      )}
    </>
  );
}
