import { supabase } from '../config/supabase.js';

// Obtener solicitudes (Filtrado inteligente por rol)
export const obtenerSolicitudes = async (req, res) => {
  try {
    const user = req.user; // Viene del middleware verificarToken
    
    // Consulta base: Traemos datos de cliente y técnico relacionados
    let query = supabase
      .from('solicitudes')
      .select(`
        *,
        clientes:cliente_id (nombre, email, telefono, direccion),
        sedes:sede_id (nombre, direccion),
        tecnicos:tecnico_id (nombre, email)
      `)
      .order('created_at', { ascending: false });

    // Si es CLIENTE, solo ve SUS solicitudes
    if (user.user_metadata?.rol === 'cliente') {
      // Usamos el ID de usuario de Supabase Auth que debe coincidir con cliente_id
      // Nota: Asegúrate de que al crear la solicitud guardes el user.id correctamente
      query = query.eq('cliente_id', user.id);
    }
    
    // Si es TÉCNICO, solo ve las ASIGNADAS a él
    if (user.user_metadata?.rol === 'tecnico') {
       query = query.eq('tecnico_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error obtener solicitudes:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const obtenerSolicitudPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('solicitudes')
      .select(`
        *,
        clientes:cliente_id (nombre, email, telefono),
        sedes:sede_id (nombre, direccion),
        tecnicos:tecnico_id (nombre, email)
      `)
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
};

export const crearSolicitud = async (req, res) => {
  try {
    const user = req.user;
    const { tipo_servicio, descripcion, sede_id, fecha_preferida, prioridad } = req.body;

    // Validaciones básicas
    if (!tipo_servicio || !descripcion || !sede_id) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    // Insertar solicitud vinculada al usuario autenticado
    const { data, error } = await supabase
      .from('solicitudes')
      .insert([{
        cliente_id: user.id, // Vinculamos con el usuario logueado
        tipo_servicio,
        descripcion,
        sede_id,
        fecha_preferida,
        prioridad: prioridad || 'media',
        estado: 'pendiente'
      }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Solicitud creada con éxito', data });
  } catch (error) {
    console.error('Error crear solicitud:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const actualizarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    // Solo permitimos actualizar ciertos campos
    const { tipo_servicio, descripcion, estado, fecha_preferida } = req.body;

    const { data, error } = await supabase
      .from('solicitudes')
      .update({
        tipo_servicio,
        descripcion,
        estado,
        fecha_preferida,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error actualizar solicitud:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const eliminarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('solicitudes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Solicitud eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ASIGNAR TÉCNICO (Función clave para el Admin)
export const asignarTecnico = async (req, res) => {
  try {
    const { id } = req.params;
    const { tecnico_id } = req.body;

    if (!tecnico_id) {
      return res.status(400).json({ success: false, error: 'El ID del técnico es requerido' });
    }

    const { data, error } = await supabase
      .from('solicitudes')
      .update({
        tecnico_id,
        estado: 'asignada', // Cambiamos estado automáticamente
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error asignar técnico:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};