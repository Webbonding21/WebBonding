import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaEnvelope, FaLock, FaSignInAlt, FaGoogle } from 'react-icons/fa';
import '../assets/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // LÓGICA DE REDIRECCIÓN:
  // Intentamos obtener la ruta desde state.from. Si no existe, vamos a /courses.
  const destination = location.state?.from?.pathname || "/courses";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Éxito: Navegamos al destino guardado
      navigate(destination, { replace: true });

    } catch (error) {
      setErrorMsg('Credenciales incorrectas o usuario no encontrado.');
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + destination
      }
    });
    if (error) console.error(error);
  };

  return (
    <div className="login-container">
      <div className="login-bg-glow"></div>

      <div className="login-card">
        <div className="login-header">
          <h2>Bienvenido de nuevo</h2>
          <p>Accede a tu panel de Web Bonding</p>
          {location.state?.from && (
            <div className="info-badge">Inicia sesión para continuar viendo la clase</div>
          )}
        </div>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group-login">
            <FaEnvelope className="input-icon" />
            <input 
              type="email" 
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group-login">
            <FaLock className="input-icon" />
            <input 
              type="password" 
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? <div className="spinner-small"></div> : (
              <>Ingresar <FaSignInAlt /></>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>O continúa con</span>
        </div>

        <button onClick={handleGoogleLogin} className="btn-google">
          <FaGoogle /> Google
        </button>

        <div className="login-footer">
          ¿No tienes cuenta? <Link to="/registerstudents">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;