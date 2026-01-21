import { supabase } from '../config/supabase.js';

export const registrarUsuario = async (req, res) => {
  // 📢 LOG PARA VERIFICAR SI EL SERVIDOR SE ACTUALIZÓ
  console.log("🔥🔥🔥 EJECUTANDO REGISTRO NUEVO V3 🔥🔥🔥"); 
  
  try {
    const { email, password, nombre, apellido = '', telefono = '', rol = 'cliente', empresa = '', direccion = '' } = req.body;

    // 1. REGISTRO AUTH
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, apellido, rol } }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se creó usuario en Auth');

    // 2. INSERTAR EN DB
    const { data: userData, error: dbError } = await supabase
      .from('usuarios')
      .insert([{
        id: authData.user.id,
        email,
        nombre,
        apellido,
        telefono,
        rol,
        empresa,
        direccion,
        estado: 'activo'
      }])
      .select()
      .single();

    if (dbError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }

    // 📢 LOG PARA VER QUÉ DATOS TENEMOS ANTES DE ENVIAR
    console.log("✅ USUARIO CREADO EN DB:", userData);

    // 3. RESPUESTA
    // Forzamos un objeto nuevo y limpio para asegurar que Express no elimine nada
    const respuesta = {
      success: true,
      message: 'Usuario registrado exitosamente',
      user: userData, // AQUÍ DEBE ESTAR EL OBJETO
      token: authData.session?.access_token || 'token_manual'
    };

    console.log("📤 ENVIANDO RESPUESTA:", respuesta);
    
    return res.status(201).json(respuesta);

  } catch (error) {
    console.error('❌ ERROR BACKEND:', error);
    return res.status(500).json({ success: false, message: error.message });
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
    // 1. Obtenemos el token del encabezado
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ valid: false, message: 'No token' });

    // 2. Verificamos con Supabase Auth (¿Es un usuario real?)
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ valid: false, message: 'Token inválido' });
    }

    // 3. ¡EL PASO QUE FALTABA! Buscamos el ROL en la tabla 'usuarios'
    const { data: perfilPublico } = await supabase
      .from('usuarios')
      .select('rol, nombre, apellido') // Pedimos explícitamente el rol
      .eq('id', user.id)
      .single();

    // 4. Respondemos mezclando los datos de Auth + Datos Públicos
    return res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        // Si no encuentra perfil, asume 'cliente' por seguridad
        rol: perfilPublico?.rol || 'cliente', 
        nombre: perfilPublico?.nombre || 'Usuario'
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ valid: false, error: error.message });
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