import * as authController from './Controllers/CTS_TB_AuthController.js';
import * as clientesController from './Controllers/CTS_TB_Clientes.js';
import * as sedesController from './Controllers/CTS_TB_Sedes.js';
import * as serviciosController from './Controllers/CTS_TB_Servicios.js';
import * as solicitudesController from './Controllers/CTS_TB_SolicitudesController.js';
import * as tecnicosController from './Controllers/CTS_TB_Tecnicos.js';

console.log('\n=== VERIFICACIÓN DE EXPORTACIONES ===\n');

console.log('📁 CTS_TB_AuthController.js:');
console.log('   Exportaciones:', Object.keys(authController));
console.log('   - registrarUsuario:', typeof authController.registrarUsuario);
console.log('   - loginUsuario:', typeof authController.loginUsuario);
console.log('   - cambiarPassword:', typeof authController.cambiarPassword);

console.log('\n📁 CTS_TB_Clientes.js:');
console.log('   Exportaciones:', Object.keys(clientesController));
console.log('   - obtenerClientes:', typeof clientesController.obtenerClientes);
console.log('   - obtenerClientePorId:', typeof clientesController.obtenerClientePorId);
console.log('   - crearCliente:', typeof clientesController.crearCliente);
console.log('   - actualizarCliente:', typeof clientesController.actualizarCliente);
console.log('   - eliminarCliente:', typeof clientesController.eliminarCliente);

console.log('\n📁 CTS_TB_Sedes.js:');
console.log('   Exportaciones:', Object.keys(sedesController));
console.log('   - obtenerSedes:', typeof sedesController.obtenerSedes);
console.log('   - obtenerSedePorId:', typeof sedesController.obtenerSedePorId);
console.log('   - obtenerSedesPorCliente:', typeof sedesController.obtenerSedesPorCliente);
console.log('   - crearSede:', typeof sedesController.crearSede);
console.log('   - actualizarSede:', typeof sedesController.actualizarSede);
console.log('   - eliminarSede:', typeof sedesController.eliminarSede);

console.log('\n📁 CTS_TB_Servicios.js:');
console.log('   Exportaciones:', Object.keys(serviciosController));
console.log('   - obtenerServicios:', typeof serviciosController.obtenerServicios);
console.log('   - obtenerServicioPorId:', typeof serviciosController.obtenerServicioPorId);
console.log('   - crearServicio:', typeof serviciosController.crearServicio);
console.log('   - actualizarServicio:', typeof serviciosController.actualizarServicio);
console.log('   - actualizarEstadoServicio:', typeof serviciosController.actualizarEstadoServicio);
console.log('   - eliminarServicio:', typeof serviciosController.eliminarServicio);

console.log('\n📁 CTS_TB_SolicitudesController.js:');
console.log('   Exportaciones:', Object.keys(solicitudesController));
console.log('   - obtenerSolicitudes:', typeof solicitudesController.obtenerSolicitudes);
console.log('   - obtenerSolicitudPorId:', typeof solicitudesController.obtenerSolicitudPorId);
console.log('   - crearSolicitud:', typeof solicitudesController.crearSolicitud);
console.log('   - actualizarSolicitud:', typeof solicitudesController.actualizarSolicitud);
console.log('   - eliminarSolicitud:', typeof solicitudesController.eliminarSolicitud);

console.log('\n📁 CTS_TB_Tecnicos.js:');
console.log('   Exportaciones:', Object.keys(tecnicosController));
console.log('   - obtenerTecnicos:', typeof tecnicosController.obtenerTecnicos);
console.log('   - obtenerTecnicosDisponibles:', typeof tecnicosController.obtenerTecnicosDisponibles);
console.log('   - obtenerTecnicoPorId:', typeof tecnicosController.obtenerTecnicoPorId);
console.log('   - crearTecnico:', typeof tecnicosController.crearTecnico);
console.log('   - actualizarTecnico:', typeof tecnicosController.actualizarTecnico);
console.log('   - eliminarTecnico:', typeof tecnicosController.eliminarTecnico);

console.log('\n=== FIN DE VERIFICACIÓN ===\n');

// Verificar funciones undefined
const funcionesRequeridas = {
  authController: ['registrarUsuario', 'loginUsuario', 'cambiarPassword'],
  clientesController: ['obtenerClientes', 'obtenerClientePorId', 'crearCliente', 'actualizarCliente', 'eliminarCliente'],
  sedesController: ['obtenerSedes', 'obtenerSedePorId', 'obtenerSedesPorCliente', 'crearSede', 'actualizarSede', 'eliminarSede'],
  serviciosController: ['obtenerServicios', 'obtenerServicioPorId', 'crearServicio', 'actualizarServicio', 'actualizarEstadoServicio', 'eliminarServicio'],
  solicitudesController: ['obtenerSolicitudes', 'obtenerSolicitudPorId', 'crearSolicitud', 'actualizarSolicitud', 'eliminarSolicitud'],
  tecnicosController: ['obtenerTecnicos', 'obtenerTecnicosDisponibles', 'obtenerTecnicoPorId', 'crearTecnico', 'actualizarTecnico', 'eliminarTecnico']
};

const controladores = {
  authController,
  clientesController,
  sedesController,
  serviciosController,
  solicitudesController,
  tecnicosController
};

console.log('🔍 BUSCANDO FUNCIONES FALTANTES:\n');
let hayErrores = false;

for (const [nombreControlador, funciones] of Object.entries(funcionesRequeridas)) {
  const controlador = controladores[nombreControlador];
  funciones.forEach(funcion => {
    if (typeof controlador[funcion] !== 'function') {
      console.error(`❌ ERROR: ${nombreControlador}.${funcion} no está definida o no es una función`);
      hayErrores = true;
    }
  });
}

if (!hayErrores) {
  console.log('✅ Todas las funciones están correctamente exportadas\n');
}