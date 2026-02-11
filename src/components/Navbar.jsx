import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import '../assets/Navbar.css'; 

const Navbar = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  // Estado para guardar la sesión del usuario
  const [user, setUser] = useState(null);

  // --- 1. Lógica de Autenticación Robustecida ---
  useEffect(() => {
    // A) Verificar sesión inicial al montar
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    // B) Escuchar cambios en tiempo real 
    // Esto es crucial: Si cierras sesión en otra pestaña o si el token expira,
    // este evento se dispara automáticamente.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Debug: puedes descomentar esto para ver qué pasa
      // console.log("Evento de Auth:", event); 
      
      if (event === 'SIGNED_OUT') {
        setUser(null); // Forzar null si el evento es cerrar sesión
      } else {
        setUser(session?.user || null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 2. Función para Cerrar Sesión Corregida ---
  const handleLogout = async () => {
    try {
      // 1. Intentar cerrar sesión en el servidor/local storage
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // 2. Limpiar estado local INMEDIATAMENTE para feedback visual
      setUser(null);
      setIsOpen(false); 
      
      // 3. Redirigir
      navigate('/'); 
      
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
      // Incluso si hay error en el server, forzamos la salida visual
      setUser(null);
      navigate('/');
    }
  };

  // --- 3. Lógica de Scroll ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false); 
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={`navbar ${!isVisible ? 'hidden' : ''} ${isOpen ? 'open' : ''}`}>
      <div className="navbar-content">
        
        {/* LOGO */}
        <div className="navbar-brand">
          <Link to="/" onClick={closeMenu}>
            <img src="/logoenblanco.png" alt="Web Bonding Logo" />
            <span className="brand-text">Web Bonding</span>
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA */}
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        {/* ENLACES */}
        <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <li><a href="/#home" onClick={closeMenu}>Inicio</a></li>
          <li><a href="/#about" onClick={closeMenu}>Nosotros</a></li>
          <li><a href="/#services" onClick={closeMenu}>Servicios</a></li>
          
          {/* Lógica Condicional para "Cursos" */}
          {user ? (
             <li>
               <Link to="/courses" onClick={closeMenu} style={{color: '#22d3ee', fontWeight: 'bold'}}>
                 Mis Cursos
               </Link>
             </li>
          ) : (
             <li><Link to="/courses" onClick={closeMenu}>Cursos</Link></li>
          )}

          <li><a href="/#contact" onClick={closeMenu}>Contacto</a></li>

          {/* BOTÓN DE ACCIÓN (CTA) */}
          <li className="cta-li">
            {user ? (
              <button onClick={handleLogout} className="nav-cta-btn logout-btn">
                <FaSignOutAlt style={{ marginRight: '8px' }} /> Salir
              </button>
            ) : (
              <Link to="/login" className="nav-cta-btn" onClick={closeMenu}>
                <FaUserCircle style={{ marginRight: '8px' }} /> Ingresar
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;