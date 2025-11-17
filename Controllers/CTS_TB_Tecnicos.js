import { supabase } from '../config/supabase.js';

export const obtenerTecnicos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tecnicos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerTecnicoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('tecnicos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Técnico no encontrado' });
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
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const eliminarTecnico = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('tecnicos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Técnico eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obtenerTecnicosDisponibles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tecnicos')
      .select('*')
      .eq('estado', 'disponible')
      .order('calificacion', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};