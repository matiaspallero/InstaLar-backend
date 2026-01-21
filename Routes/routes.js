import express from 'express';
import * as tecnicosController from '../Controllers/CTS_TB_Tecnicos.js';
import * as clientesController from '../Controllers/CTS_TB_Clientes.js';
import * as sedesController from '../Controllers/CTS_TB_Sedes.js';
import * as serviciosController from '../Controllers/CTS_TB_Servicios.js';
import * as solicitudesController from '../Controllers/CTS_TB_SolicitudesController.js';
import * as authController from '../Controllers/CTS_TB_AuthController.js';

import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// RUTAS PARA TÉCNICOS
// ============================================
router.get('/tecnicos', tecnicosController.obtenerTecnicos);
router.get('/tecnicos/disponibles/lista', tecnicosController.obtenerTecnicosDisponibles);
router.get('/tecnicos/:id', tecnicosController.obtenerTecnicoPorId);
router.post('/tecnicos', tecnicosController.crearTecnico);
router.put('/tecnicos/:id', tecnicosController.actualizarTecnico);
router.delete('/tecnicos/:id', tecnicosController.eliminarTecnico);

// ============================================
// RUTAS PARA CLIENTES
// ============================================
router.get('/clientes', clientesController.obtenerClientes);
router.get('/clientes/:id', clientesController.obtenerClientePorId);
router.post('/clientes', clientesController.crearCliente);
router.put('/clientes/:id', clientesController.actualizarCliente);
router.delete('/clientes/:id', clientesController.eliminarCliente);

// ============================================
// RUTAS PARA SEDES
// ============================================
router.get('/sedes', sedesController.obtenerSedes);
router.get('/sedes/cliente/:clienteId', sedesController.obtenerSedesPorCliente);
router.get('/sedes/:id', sedesController.obtenerSedePorId);
router.get('/sedes/usuario/:usuario_id', protect, sedesController.obtenerMisSedes);
router.post('/sedes', sedesController.crearSede);
router.put('/sedes/:id', sedesController.actualizarSede);
router.delete('/sedes/:id', sedesController.eliminarSede);

// ============================================
// RUTAS PARA SERVICIOS
// ============================================
router.get('/servicios', protect, serviciosController.obtenerServicios);
router.get('/servicios/:id', protect, serviciosController.obtenerServicioPorId);
router.get('/servicios/usuario/:usuario_id', protect, serviciosController.obtenerMisServicios);
router.post('/servicios', protect, serviciosController.crearServicio);
router.put('/servicios/:id', protect, serviciosController.actualizarServicio);
router.patch('/servicios/:id/estado', protect, serviciosController.actualizarEstadoServicio);
router.delete('/servicios/:id', protect, serviciosController.eliminarServicio);
router.post('/servicios/solicitar', protect, serviciosController.solicitarServicioCliente);
// Nueva ruta para obtener servicios pendientes de asignación
router.get('/solicitudes', protect, serviciosController.obtenerSolicitudesPendientes);
router.patch('/solicitudes/:id/asignar-tecnico', protect, serviciosController.asignarTecnicoServicio);
router.get('/servicios/tecnico/mis-trabajos', protect, serviciosController.obtenerTrabajosTecnico);


// ============================================
// RUTAS PARA SOLICITUDES (NUEVO FLUJO)
// ============================================
// Nota: Usamos verificarToken para saber quién hace la petición
//router.get('/solicitudes', authController.verifyToken, solicitudesController.obtenerSolicitudes);
router.get('/solicitudes/:id', authController.verifyToken, solicitudesController.obtenerSolicitudPorId);
router.post('/solicitudes', authController.verifyToken, solicitudesController.crearSolicitud);
router.put('/solicitudes/:id', authController.verifyToken, solicitudesController.actualizarSolicitud);
//router.patch('/solicitudes/:id/asignar-tecnico', authController.verifyToken, solicitudesController.asignarTecnico); // Para el Admin
//router.delete('/solicitudes/:id', authController.verifyToken, solicitudesController.eliminarSolicitud);

// ============================================
// RUTAS PARA AUTENTICACIÓN
// ============================================
router.post('/auth/register', authController.registrarUsuario);
router.post('/auth/login', authController.loginUsuario);
router.post('/auth/logout', authController.logout);
//router.put('/auth/change-password', authController.cambiarPassword);
router.get('/auth/verify', authController.verifyToken);

export default router;