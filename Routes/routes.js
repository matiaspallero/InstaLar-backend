import express from 'express';
import * as tecnicosController from '../Controllers/CTS_TB_Tecnicos.js';
import * as clientesController from '../Controllers/CTS_TB_Clientes.js';
import * as sedesController from '../Controllers/CTS_TB_Sedes.js';
import * as serviciosController from '../Controllers/CTS_TB_Servicios.js';
import * as authController from '../Controllers/CTS_TB_AuthController.js';

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
router.post('/sedes', sedesController.crearSede);
router.put('/sedes/:id', sedesController.actualizarSede);
router.delete('/sedes/:id', sedesController.eliminarSede);

// ============================================
// RUTAS PARA SERVICIOS
// ============================================
router.get('/servicios', serviciosController.obtenerServicios);
router.get('/servicios/:id', serviciosController.obtenerServicioPorId);
router.post('/servicios', serviciosController.crearServicio);
router.put('/servicios/:id', serviciosController.actualizarServicio);
router.patch('/servicios/:id/estado', serviciosController.actualizarEstadoServicio);
router.delete('/servicios/:id', serviciosController.eliminarServicio);

// ============================================
// RUTAS PARA AUTENTICACIÓN
// ============================================
router.post('/login', authController.login);

export default router;