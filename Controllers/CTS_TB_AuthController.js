// Controllers/authController.js
import { supabase } from '../config/supabase.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Opción A: Autenticación real con Supabase Auth
  /* const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return res.status(401).json({ error: error.message });
  return res.json({ user: data.user, token: data.session.access_token });
  */

  // Opción B: Login simple (Hardcodeado para tu prueba inicial)
  // Esto coincide con el mensaje de error de tu Login.jsx
  if (email === 'admin@instalar.com' && password === 'admin') {
    return res.json({ 
      user: { email: 'admin@instalar.com', nombre: 'Administrador' },
      token: 'token-falso-de-prueba-123' 
    });
  }

  return res.status(401).json({ error: 'Credenciales inválidas' });
};