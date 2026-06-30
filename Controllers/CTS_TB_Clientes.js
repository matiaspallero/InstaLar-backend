import { supabase } from '../config/supabase.js';

export const obtenerClientes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const crearCliente = async (req, res) => {
  try {
    // Recibimos los datos del formulario de registro
    // nombre = Nombre de la persona (Contacto)
    // empresa = Nombre de la empresa
    const { nombre, contacto, empresa, email, telefono, direccion, ciudad, ruc, usuario_id } = req.body;

    // MAPEO DE DATOS: Ajustamos lo que llega a las columnas de TU tabla
    const datosParaDB = {
      nombre: empresa || nombre, // Columna 'nombre' = Nombre de la Empresa
      contacto: contacto || nombre, // Columna 'contacto' = Nombre de la Persona
      email,
      telefono,
      direccion,
      ciudad: ciudad || 'Sin especificar', // Valor por defecto si no viene en req.body
      ruc: ruc || '00000000000',        // Valor por defecto si no viene en req.body
      usuario_id: usuario_id || null
    };

    // Insertamos en la tabla 'clientes'
    const { data, error } = await supabase
      .from('clientes')
      .insert([datosParaDB])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    return res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al crear el cliente' 
    });
  }
};

export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('clientes')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Cliente no encontrado para actualizar' });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('clientes')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// RESTAURAR CLIENTE (Recuperar soft deleted)
export const restaurarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('clientes')
      .update({
        is_deleted: false,
        deleted_at: null
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Cliente restaurado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};