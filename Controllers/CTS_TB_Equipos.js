import { supabase } from '../config/supabase.js';

// Obtener todos los equipos
export const obtenerEquipos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('equipos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un equipo por ID
export const obtenerEquipoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🔍 Buscando equipo con ID:', id);

        // Obtener equipo
        const { data: equipo, error: equipoError } = await supabase
            .from('equipos')
            .select('*')
            .eq('id', id)
            .single();

        if (equipoError) {
            console.error('❌ Error al obtener equipo:', equipoError);
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        console.log('✅ Equipo encontrado:', equipo);

        // Obtener cliente y sede en paralelo
        const [clienteRes, sedeRes] = await Promise.all([
            supabase
                .from('clientes')
                .select('nombre, email, telefono, direccion')
                .eq('usuario_id', equipo.usuario_id)
                .single(),
            supabase
                .from('sedes')
                .select('nombre, direccion, ciudad, telefono')
                .eq('id', equipo.sede_id)
                .single()
        ]);

        // Log de errores individuales
        if (clienteRes.error) {
            console.warn('⚠️ Cliente no encontrado para usuario_id:', equipo.usuario_id, clienteRes.error);
        }
        if (sedeRes.error) {
            console.warn('⚠️ Sede no encontrada para sede_id:', equipo.sede_id, sedeRes.error);
        }

        res.json({
            ...equipo,
            clientes: clienteRes.data || null,
            sedes: sedeRes.data || null
        });
    } catch (err) {
        console.error('💥 Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Obtener equipos por sede_id
export const obtenerEquiposPorSede = async (req, res) => {
    try {
        const { sede_id } = req.params;

        const { data, error } = await supabase
            .from('equipos')
            .select('*')
            .eq('sede_id', sede_id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener equipos por cliente_id
export const obtenerEquiposPorCliente = async (req, res) => {
    try {
        const { cliente_id } = req.params;

        const { data, error } = await supabase
            .from('equipos')
            .select('*')
            .eq('cliente_id', cliente_id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Buscar equipo por serie
export const obtenerEquipoPorSerie = async (req, res) => {
    try {
        const { serie } = req.params;

        const { data, error } = await supabase
            .from('equipos')
            .select('*')
            .eq('serie', serie)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener servicios asociados a un equipo
export const obtenerServiciosEquipo = async (req, res) => {
    try {
        const { id } = req.params;

        // Primero verificar que el equipo existe
        const { data: equipo, error: equipoError } = await supabase
            .from('equipos')
            .select('*')
            .eq('id', id)
            .single();

        if (equipoError) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        // Obtener los servicios del equipo
        const { data: servicios, error: serviciosError } = await supabase
            .from('servicios')
            .select('*')
            .eq('equipo_id', id)
            .order('created_at', { ascending: false });

        if (serviciosError) {
            return res.status(400).json({ error: serviciosError.message });
        }

        res.json({
            equipo,
            servicios
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un nuevo equipo
export const crearEquipo = async (req, res) => {
    try {
        const { sede_id, cliente_id, tipo, marca, modelo, serie, frigorias, fecha_instalacion, estado, observaciones, voltaje } = req.body;

        // Validar campos requeridos
        if (!sede_id || !cliente_id) {
            return res.status(400).json({ error: 'sede_id y cliente_id son requeridos' });
        }

        // 🔍 LOG para ver qué datos se envían
        console.log('📦 Creando equipo con datos:', {
            sede_id,
            usuario_id: cliente_id,
            tipo,
            marca,
            modelo,
            serie,
            frigorias,
            fecha_instalacion,
            estado: estado || 'activo',
            voltaje: voltaje || '220'
        });

        const { data, error } = await supabase
            .from('equipos')
            .insert([
                {
                    sede_id,
                    usuario_id: cliente_id,
                    tipo,
                    marca,
                    modelo,
                    serie,
                    frigorias,
                    fecha_instalacion,
                    estado: estado || 'activo',
                    observaciones,
                    voltaje: voltaje || '220'
                }
            ])
            .select();

        if (error) {
            // 🔴 LOG del error completo
            console.error('❌ Error al crear equipo en Supabase:', error);

            return res.status(400).json({ 
                error: error.message,
                code: error.code,
                details: error.details,
                hint: 'Posibles causas: sede_id o cliente_id inválido, serie duplicada, o error de restricción de clave foránea'
            });
        }

        // ✅ LOG de éxito
        console.log('✅ Equipo creado correctamente:', data[0]);
        res.status(201).json(data[0]);

    } catch (err) {
        console.error('💥 Error no controlado en crearEquipo:', err);
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un equipo
export const actualizarEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, marca, modelo, serie, frigorias, fecha_instalacion, estado, observaciones, voltaje } = req.body;

        const { data, error } = await supabase
            .from('equipos')
            .update({
                tipo,
                marca,
                modelo,
                serie,
                frigorias,
                fecha_instalacion,
                estado,
                observaciones,
                voltaje,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un equipo
export const eliminarEquipo = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('equipos')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json({ mensaje: 'Equipo eliminado correctamente', equipo: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};