import { supabase } from '../config/supabase.js';

export const registrarUsuario = async (req, res) => {
  try {
    // Declarar SOLO UNA VEZ todas las variables
    let newAuthUser = null; // Para poder limpiar en caso de error

    const {
      email, 
      password, 
      nombre, 
      apellido = '',
      telefono = '',
      rol = 'cliente',
      empresa = '',
      especialidad = '',
      direccion = '',
      estado = 'activo'
    } = req.body;

    // Validaciones
    if (!email || !password || !nombre) {
      return res.status(400).json({
        success: false,
        message: 'Email, password y nombre son requeridos'
      });
    }

    // 1. Registrar en Supabase Auth
    // Paso 1: Registrar en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, apellido, rol }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');
    if (!authData.user) throw new Error('No se pudo crear el usuario en Supabase Auth');
    newAuthUser = authData.user;

    // 2. Insertar en tabla usuarios
    // Paso 2: Insertar el perfil en tu tabla 'usuarios'
    const { data: userData, error: dbError } = await supabase
      .from('usuarios')
      .insert([{
        id: authData.user.id,
        id: newAuthUser.id,
        email,
        nombre,
        apellido,
        telefono,
        rol,
        empresa,
        especialidad,
        direccion,
        estado
      }])
      .select()
      .single();

    if (dbError) {
      // Si falla, eliminar el usuario de auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      // Si la inserción del perfil falla, eliminamos el usuario de Auth para mantener la consistencia.
      await supabase.auth.admin.deleteUser(newAuthUser.id);
      throw dbError;
    }

    // 3. Crear sesión
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    // Paso 3: Devolver la respuesta.
    // La llamada a signUp ya devuelve una sesión si autoconfirm está activado.
    // No es necesario hacer un signInWithPassword de nuevo.
    if (authData.session) {
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado y logueado exitosamente.',
        user: userData,
        token: authData.session.access_token
      });
    } else {
      // Si autoconfirm está desactivado, el usuario debe verificar su email.
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado. Por favor, revisa tu email para confirmar tu cuenta.',
        user: userData,
        token: null // No hay token hasta la confirmación
      });
    }

    if (sessionError) throw sessionError;

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: userData,
      token: sessionData.session.access_token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al registrar usuario'
    });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password son requeridos'
      });
    }

    // Autenticar con Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      if (authError.message === 'Invalid login credentials') {
        return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos.' });
      }
      throw authError;
    }

    // Obtener datos del usuario desde la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) throw userError;

    return res.json({
      success: true,
      user: userData,
      token: authData.session.access_token
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(401).json({
      success: false,
      message: 'Error interno del servidor durante el login.'
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ valid: false, message: 'No se proporcionó token.' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ valid: false, message: 'Token inválido o expirado.' });
    }

    // Devolvemos solo la información necesaria y segura para el frontend
    const { id, email, user_metadata } = data.user;
    return res.json({ 
      valid: true, 
      user: { id, email, rol: user_metadata.rol, nombre: user_metadata.nombre } 
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(401).json({ valid: false, message: 'Error al procesar el token.' });
  }
};

export const logout = async (req, res) => {
  try {
    // Para un logout más seguro desde el backend, invalidamos el token.
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const { error } = await supabase.auth.signOut(token);
      if (error) {
        // Un error aquí puede significar que el token ya era inválido, lo cual está bien.
        console.warn('Advertencia durante el logout (puede ser benigno):', error.message);
      }
    }
    
    return res.json({ success: true, message: 'Sesión cerrada correctamente.' });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor durante el logout.' });
  }
};