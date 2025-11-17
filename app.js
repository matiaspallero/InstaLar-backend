import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './Routes/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  // console.log(`${req.method} ${req.path}`);
  next();
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
      servicios: '/api/servicios'
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
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: Supabase conectada`);
});

export default app;