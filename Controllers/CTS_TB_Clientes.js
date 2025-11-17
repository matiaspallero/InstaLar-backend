import { supabase } from '../config/supabase.js';

export const obtenerClientes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Cliente no encontrado' });
  }
};

export const crearCliente = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};