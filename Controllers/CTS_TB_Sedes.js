import { supabase } from '../config/supabase.js';

export const obtenerSedes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sedes')
      .select('*, clientes(nombre)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerSedePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('sedes')
      .select('*, clientes(nombre)')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Sede no encontrada' });
  }
};

export const obtenerSedesPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { data, error } = await supabase
      .from('sedes')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('is_deleted', false);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerMisSedes = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    // 1. Buscamos el ID de cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (!cliente) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });

    // 2. Buscamos sus sedes
    const { data: sedes, error } = await supabase
      .from('sedes')
      .select('*')
      .eq('cliente_id', cliente.id)
      .eq('is_deleted', false);

    if (error) throw error;
    res.json({ success: true, data: sedes });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const crearSede = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sedes')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const actualizarSede = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('sedes')
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

export const eliminarSede = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('sedes')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Sede eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// RESTAURAR SEDE (Recuperar soft deleted)
export const restaurarSede = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('sedes')
      .update({
        is_deleted: false,
        deleted_at: null
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Sede restaurada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};