// src/lib/contenido.js
// El contenido de la web que se maneja desde /admin (cifras, servicios, proyectos, planes, preguntas, las apps de la
// vitrina, el catálogo del cotizador…). Está en web_bonding.contenido (supabase/admin.sql) y la web lo lee de una vez,
// para todas las secciones, con public.ver_contenido(), que solo devuelve lo visible y en su orden.
// Cada sección arranca con lo que trae el código (src/data) y se cambia por lo de la base apenas llega; si la base no
// responde, se queda lo del código y la página nunca sale vacía por eso.
import { useEffect, useState } from 'react';
import { supabaseR4 } from '../components/r4/r4Api';

let promesa = null;

// { seccion: [datos, …] } con lo visible de todas las secciones; null si la base todavía no tiene nada
export function cargarContenido() {
  if (!promesa) {
    promesa = supabaseR4.rpc('ver_contenido').then(({ data, error }) => {
      if (error) throw error;
      if (!data?.length) return null;
      const porSeccion = {};
      data.forEach((f) => { (porSeccion[f.seccion] ??= []).push(f.datos); });
      return porSeccion;
    });
    // si falló, la próxima página que lo pida vuelve a intentar
    promesa.catch(() => { promesa = null; });
  }
  return promesa;
}

// la lista de una sección: `base` mientras llega la de la base (o si no llega). Una sección que en la base quedó vacía o
// toda oculta devuelve [] y la página no la muestra.
export function useContenido(seccion, base) {
  const [lista, setLista] = useState(base);
  useEffect(() => {
    let vivo = true;
    cargarContenido()
      .then((todo) => { if (vivo && todo) setLista(todo[seccion] ?? []); })
      .catch(() => {});
    return () => { vivo = false; };
  }, [seccion]);
  return lista;
}

// «01», «02»… del orden en que salen
export const numero = (i) => String(i + 1).padStart(2, '0');
