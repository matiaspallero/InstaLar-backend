import { supabase } from '../config/supabase.js';

export const protect = async (req, res, next) => {
  try {
    // 1. Buscamos el token en los headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No autorizado, falta token' });
    }

    // 2. Verificamos con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }

    // 3. Guardamos el usuario en la petición para usarlo luego
    req.user = user;

    // 4. ¡LA CLAVE! Dejamos pasar la petición
    next(); 

  } catch (error) {
    console.error('Error en middleware:', error);
    res.status(401).json({ success: false, message: 'Error de autenticación' });
  }
};