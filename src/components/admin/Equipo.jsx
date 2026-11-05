/* eslint-disable react/prop-types */
// Los usuarios del equipo (los de Supabase Auth del proyecto, los mismos de R4 y el cotizador) con su rol, que el
// administrador cambia aquí. El propio no se cambia, para que nadie se quede sin entrar.
import { useCallback, useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { cambiarRol, listarEquipo, mensajeDeError } from './datos';
import { ROLES } from './secciones';


const fecha = (iso) => (iso ? new Date(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Nunca');

export default function Equipo({ yo }) {
  const [usuarios, setUsuarios] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try { setUsuarios(await listarEquipo()); setError(''); } catch (err) { setError(mensajeDeError(err)); setUsuarios((u) => u ?? []); }
    setCargando(false);
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = async (u, rol) => {
    setAviso(''); setError('');
    setUsuarios((l) => l.map((x) => (x.id === u.id ? { ...x, rol } : x)));
    try {
      await cambiarRol(u.id, rol);
      setAviso(`${u.correo} ahora es ${ROLES[rol].t.toLowerCase()}. Lo ve la próxima vez que entre.`);
    } catch (err) { setError(mensajeDeError(err)); cargar(); }
  };

  return (
    <div className="pn-equipo">
      <div className="pn-cab">
        <div>
          <h1>Usuarios</h1>
          <p>Quién entra al panel y qué puede hacer. Es el mismo usuario para el panel, el cotizador y R4.</p>
        </div>
        <button type="button" className="pn-ico" onClick={cargar} aria-label="Actualizar" title="Actualizar" disabled={cargando}>
          <FiRefreshCw aria-hidden="true" className={cargando ? 'ld-girando' : ''} />
        </button>
      </div>

      {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
      {aviso && <p className="pn-aviso" role="status"><FiCheck aria-hidden="true" /> {aviso}</p>}

      {usuarios === null ? <p className="pn-nota">Cargando…</p> : (
        <ul className="pn-usuarios">
          {usuarios.map((u) => (
            <li key={u.id}>
              <span className="pn-usuarios__quien">
                <b>{u.correo}{u.id === yo && <i>Tú</i>}</b>
                <span>Desde el {fecha(u.creado)} · último acceso: {fecha(u.ultimo_acceso)}</span>
              </span>
              <select className="ld-campo" value={u.rol} disabled={u.id === yo} onChange={(e) => cambiar(u, e.target.value)}
                aria-label={`Rol de ${u.correo}`} title={u.id === yo ? 'Tu propio rol no se cambia desde aquí' : ''}>
                {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.t}</option>)}
              </select>
            </li>
          ))}
        </ul>
      )}

      <dl className="pn-roles">
        {Object.entries(ROLES).map(([k, r]) => <div key={k}><dt>{r.t}</dt><dd>{r.d}</dd></div>)}
      </dl>
      <p className="pn-nota">
        Para darle acceso a alguien nuevo, créale el usuario en Supabase (Authentication → Users → Add user). Entra como
        «Solo lectura» y aquí le das el rol.
      </p>
    </div>
  );
}
