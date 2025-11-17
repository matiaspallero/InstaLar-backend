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