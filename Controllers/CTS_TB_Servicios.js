import { supabase } from '../config/supabase.js';

export const obtenerServicios = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('servicios')
      .select(`
        *,
        clientes(nombre),
        sedes(nombre),
        tecnicos(nombre)
      `)
      .neq('estado', 'pendiente') // Excluimos los pendientes
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerServicioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('servicios')
      .select(`
        *,
        clientes(nombre),
        sedes(nombre),
        tecnicos(nombre)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Servicio no encontrado' });
  }
};

export const obtenerMisServicios = async (req, res) => {
  try {
    const { usuario_id } = req.params; // Recibimos el ID del usuario logueado

    // 1. Buscamos el ID de Cliente asociado a este Usuario
    const { data: datosCliente, error: errorCliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (errorCliente || !datosCliente) {
      return res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado. Contacte soporte.' });
    }

    // 2. Buscamos solo los servicios de ESE cliente
    const { data: servicios, error: errorServicios } = await supabase
      .from('servicios')
      .select(`
        *,
        tecnicos (nombre),
        sedes (nombre, direccion)
      `)
      .eq('cliente_id', datosCliente.id) // <--- EL FILTRO CLAVE
      .order('created_at', { ascending: false });

    if (errorServicios) throw errorServicios;

    return res.json({ success: true, data: servicios });

  } catch (error) {
    console.error('Error al obtener mis servicios:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const crearServicio = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('servicios')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('servicios')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const actualizarEstadoServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const { data, error } = await supabase
      .from('servicios')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('servicios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const solicitarServicioCliente = async (req, res) => {
  try {
    // Recibimos TODOS los datos del formulario
    const { 
      usuario_id, 
      sede_id, 
      descripcion, 
      tipo, 
      fecha, 
      hora, 
      equipo, 
      marca, 
      modelo 
    } = req.body;

    console.log("📝 Nueva solicitud de servicio recibida");

    // Validaciones de campos obligatorios (según tu tabla)
    if (!sede_id || !tipo || !fecha || !hora) {
      return res.status(400).json({ success: false, message: "Faltan datos obligatorios (Sede, Tipo, Fecha u Hora)." });
    }

    // 1. Buscamos el ID de cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
    }

    // 2. Insertamos directamente en la tabla con las columnas correctas
    const { data, error } = await supabase
      .from('servicios')
      .insert([{
        cliente_id: cliente.id,
        sede_id: sede_id,
        tipo: tipo,                // Columna 'tipo' (varchar)
        fecha: fecha,              // Columna 'fecha' (date)
        hora: hora,                // Columna 'hora' (time)
        descripcion: descripcion,  // Columna 'descripcion' (text)
        equipo: equipo || null,    // Columnas opcionales
        marca: marca || null,
        modelo: modelo || null,
        estado: 'pendiente',       // Estado inicial por defecto
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    
    console.log("✅ Servicio creado ID:", data.id);
    res.status(201).json({ success: true, data });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(400).json({ 
      success: false, 
      message: error.message || "Error al guardar el servicio" 
    });
  }
};

export const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    // Buscamos en 'servicios' solo lo que esté 'pendiente'
    const { data, error } = await supabase
      .from('servicios')
      .select(`
        *,
        clientes:cliente_id (nombre, email, telefono, direccion),
        sedes:sede_id (nombre, direccion),
        tecnicos:tecnico_id (nombre, email)
      `)
      .eq('estado', 'pendiente') // <--- FILTRO CLAVE
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });

  } catch (error) {
    console.error('Error pendientes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Función para ASIGNAR TÉCNICO (Convierte Solicitud en Servicio Activo)
export const asignarTecnicoServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { tecnico_id } = req.body;

    if (!tecnico_id) return res.status(400).json({ success: false, message: 'Falta técnico' });

    const { data, error } = await supabase
      .from('servicios')
      .update({
        tecnico_id: tecnico_id,
        estado: 'en-proceso', // <--- CAMBIA DE ESTADO (Desaparece de Solicitudes, va a Servicios)
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const obtenerTrabajosTecnico = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    // 1. Buscamos el ID del técnico asociado al usuario logueado
    // (Nota: Asumimos que la columna usuario_id existe porque la actualizamos en el paso anterior)
    const { data: tecnico, error: errTecnico } = await supabase
      .from('tecnicos')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (errTecnico || !tecnico) {
      return res.status(404).json({ success: false, message: 'Perfil de técnico no encontrado.' });
    }

    // 2. Buscamos los servicios y hacemos el JOIN con Clientes y Sedes
    const { data: servicios, error } = await supabase
      .from('servicios')
      .select(`
        *,
        clientes (
          nombre,
          telefono,
          email,
          direccion
        ),
        sedes (
          nombre,
          direccion,
          ciudad
        )
      `)
      .eq('tecnico_id', tecnico.id)
      .neq('estado', 'cancelado') // Opcional: Ocultar cancelados
      .order('fecha', { ascending: true }); // Ordenar por fecha más próxima

    if (error) throw error;

    console.log("✅ Trabajos encontrados:", servicios.length);
    res.json({ success: true, data: servicios });

  } catch (error) {
    console.error("❌ Error al obtener trabajos:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};