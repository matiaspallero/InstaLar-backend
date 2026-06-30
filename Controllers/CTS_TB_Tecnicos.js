import { supabase } from '../config/supabase.js';

export const obtenerTecnicos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tecnicos')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const obtenerTecnicoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('tecnicos')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Técnico no encontrado' });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al obtener técnico por ID:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const crearTecnico = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tecnicos')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const actualizarTecnico = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('tecnicos')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Técnico no encontrado para actualizar' });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al actualizar técnico:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const eliminarTecnico = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('tecnicos')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Técnico eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// RESTAURAR TÉCNICO (Recuperar soft deleted)
export const restaurarTecnico = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('tecnicos')
      .update({
        is_deleted: false,
        deleted_at: null
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Técnico restaurado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const obtenerTecnicosDisponibles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tecnicos')
      .select('*')
      .eq('estado', 'disponible')
      .eq('is_deleted', false)
      .order('calificacion', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};