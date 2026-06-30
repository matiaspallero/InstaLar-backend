import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './Routes/routes.js';
import { supabase } from './config/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://instalar.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  // console.log(`${req.method} ${req.path}`);
  next();
});

// Keepalive para evitar pausa por inactividad
app.get('/api/keepalive', async (req, res) => {
  try {
    const { error } = await supabase
      .from('clientes')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Montar todas las rutas bajo /api
app.use('/api', router);

// Ruta de prueba raíz
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API InstaLar funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      tecnicos: '/api/tecnicos',
      clientes: '/api/clientes',
      sedes: '/api/sedes',
      servicios: '/api/servicios',
      equipos: '/api/equipos',
      solicitudes: '/api/solicitudes'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en ${PORT}`);
  console.log(`📊 Base de datos: Supabase conectada`);
});

export default app;