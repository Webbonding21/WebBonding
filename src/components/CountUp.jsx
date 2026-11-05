/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';

/** Cuenta de 0 a `to` cuando entra en viewport. Si `to` cambia (la cifra de la base llega después de la del código),
 *  la cuenta termina en el número nuevo, y si ya había terminado, lo pone sin volver a contar. */
export default function CountUp({ to, duration = 1700, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const done = useRef(false);
  const target = useRef(to);
  target.current = to;

  useEffect(() => {
    if (done.current) setVal(to);
  }, [to]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(target.current * eased);
              if (p < 1) requestAnimationFrame(tick);
              else {
                setVal(target.current);
                done.current = true;
              }
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [duration]);

  const display = decimals
    ? val.toFixed(decimals)
    : Math.round(val).toLocaleString('es-VE');

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
