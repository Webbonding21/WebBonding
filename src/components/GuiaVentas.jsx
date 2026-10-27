/* eslint-disable react/prop-types */
// Guía de ventas del cotizador del equipo: todo lo que un closer necesita para vender. El texto no está en el código
// de la web (que es público): lo entrega public.ver_guia_ventas() solo a los roles admin y ventas. Se edita en
// marketing/ventas/guia-ventas.md y se sube con ventas/subir-guia.py.
import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiCopy, FiCheck, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { supabaseR4 } from './r4/r4Api';
import '../assets/GuiaVentas.css';

const slug = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// cada «## Título» es una sección
const secciones = (md) => md.split(/^## /m).filter((s) => s.trim()).map((s) => {
  const [titulo, ...resto] = s.split('\n');
  return { id: slug(titulo), titulo: titulo.trim(), cuerpo: resto.join('\n') };
});

// Markdown mínimo: ### subtítulos, párrafos, listas, tablas y «> » para los mensajes que se copian
const INICIO_DE_BLOQUE = /^(### |\||> |- |\d+\. )/;
function bloques(md) {
  const lineas = md.split('\n');
  const out = [];
  let i = 0;
  const tomar = (cumple, limpiar) => {
    const partes = [];
    while (i < lineas.length && cumple(lineas[i])) partes.push(limpiar(lineas[i++]));
    return partes;
  };
  while (i < lineas.length) {
    const l = lineas[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith('### ')) { out.push({ t: 'h3', texto: l.slice(4) }); i++; continue; }
    if (l.startsWith('|')) {
      const filas = tomar((x) => x.startsWith('|'), (x) => x.split('|').slice(1, -1).map((c) => c.trim()));
      out.push({ t: 'tabla', cabeza: filas[0], filas: filas.slice(2) });
    } else if (l.startsWith('>')) {
      out.push({ t: 'mensaje', texto: tomar((x) => x.startsWith('>'), (x) => x.replace(/^>\s?/, '')).join('\n') });
    } else if (l.startsWith('- ')) {
      out.push({ t: 'ul', items: tomar((x) => x.startsWith('- '), (x) => x.slice(2)) });
    } else if (/^\d+\. /.test(l)) {
      out.push({ t: 'ol', items: tomar((x) => /^\d+\. /.test(x), (x) => x.replace(/^\d+\. /, '')) });
    } else {
      out.push({ t: 'p', texto: tomar((x) => x.trim() && !INICIO_DE_BLOQUE.test(x), (x) => x).join(' ') });
    }
  }
  return out;
}

// **negritas** y enlaces a webbonding.net
const enLinea = (texto) => texto.split(/(\*\*[^*]+\*\*|webbonding\.net\/[\w\-/]+)/g).map((p, k) => {
  if (p.startsWith('**') && p.endsWith('**')) return <strong key={k}>{p.slice(2, -2)}</strong>;
  if (p.startsWith('webbonding.net/')) return <a key={k} href={`https://${p}`} target="_blank" rel="noopener noreferrer">{p}</a>;
  return p;
});

function Mensaje({ texto }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* sin portapapeles: se puede seleccionar el texto a mano */ }
  };
  return (
    <div className="gv-mensaje">
      <p>{texto}</p>
      <button type="button" onClick={copiar}>{copiado ? <><FiCheck aria-hidden="true" /> Copiado</> : <><FiCopy aria-hidden="true" /> Copiar</>}</button>
    </div>
  );
}

function Bloque({ b }) {
  switch (b.t) {
    case 'h3': return <h3>{enLinea(b.texto)}</h3>;
    case 'ul': return <ul>{b.items.map((x, k) => <li key={k}>{enLinea(x)}</li>)}</ul>;
    case 'ol': return <ol>{b.items.map((x, k) => <li key={k}>{enLinea(x)}</li>)}</ol>;
    case 'mensaje': return <Mensaje texto={b.texto} />;
    case 'tabla': return (
      <div className="gv-tabla">
        <table>
          <thead><tr>{b.cabeza.map((c, k) => <th key={k}>{enLinea(c)}</th>)}</tr></thead>
          <tbody>{b.filas.map((f, k) => <tr key={k}>{f.map((c, j) => <td key={j}>{enLinea(c)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
    default: return <p>{enLinea(b.texto)}</p>;
  }
}

export default function GuiaVentas() {
  const [md, setMd] = useState(null);
  const [error, setError] = useState('');
  const [activa, setActiva] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    supabaseR4.rpc('ver_guia_ventas').then(({ data, error: err }) => {
      if (err) {
        setError(err.message === 'No autorizado'
          ? 'Tu usuario no tiene permiso para la guía: hace falta el rol de ventas o de administrador.'
          : `No se pudo cargar la guía: ${err.message}`);
      } else setMd(data);
    });
  }, []);

  const lista = useMemo(() => (md ? secciones(md) : []), [md]);
  const q = busca.trim().toLowerCase();
  const visibles = q ? lista.filter((s) => `${s.titulo}\n${s.cuerpo}`.toLowerCase().includes(q)) : lista;
  const actual = visibles.find((s) => s.id === activa) ?? visibles[0];
  const siguiente = actual && lista[lista.findIndex((s) => s.id === actual.id) + 1];

  const ir = (id) => {
    setActiva(id);
    document.querySelector('.gv')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (error) return <p className="gv-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>;
  if (!md) return <p className="gv-cargando">Cargando la guía…</p>;

  return (
    <div className="gv">
      <aside className="gv-nav" aria-label="Secciones de la guía">
        <label className="gv-buscar">
          <FiSearch aria-hidden="true" />
          <input type="search" placeholder="Buscar en la guía" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <nav className="gv-secciones">
          {visibles.map((s) => (
            <button type="button" key={s.id} aria-current={s.id === actual?.id} onClick={() => ir(s.id)}>{s.titulo}</button>
          ))}
          {!visibles.length && <p className="gv-nada">Nada con «{busca}».</p>}
        </nav>
      </aside>

      {actual && (
        <article className="gv-hoja" key={actual.id}>
          <h2>{actual.titulo}</h2>
          {bloques(actual.cuerpo).map((b, k) => <Bloque key={k} b={b} />)}
          {siguiente && !q && (
            <button type="button" className="gv-siguiente" onClick={() => ir(siguiente.id)}>
              Siguiente: {siguiente.titulo} <FiArrowRight aria-hidden="true" />
            </button>
          )}
        </article>
      )}
    </div>
  );
}
