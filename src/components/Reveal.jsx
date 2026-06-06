import { useEffect, useRef, useState } from 'react';

/**
 * Envuelve contenido y lo revela al entrar en viewport.
 * props: as (tag), variant ('from-left' | 'from-right' | 'zoom'), delay ('d1'..'d6')
 */
export default function Reveal({
  as: Tag = 'div',
  className = '',
  variant = '',
  delay = '',
  once = true,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.unobserve(el);
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${variant} ${delay} ${shown ? 'in' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
