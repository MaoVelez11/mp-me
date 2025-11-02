const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const authMiddleware = require('../middleware/authMiddleware'); // Protegeremos "Cerrar Día"

// Rutas públicas (para guardar y ver la bitácora del día)
router.post('/', movimientoController.crearMovimiento);
router.get('/', movimientoController.obtenerMovimientos);

// Rutas protegidas (solo admin puede cerrar el día y ver etiquetas)
router.post('/cerrar-dia', authMiddleware, movimientoController.cerrarDia);
router.get('/etiquetas', authMiddleware, movimientoController.obtenerEtiquetas);

module.exports = router;