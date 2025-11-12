const express = require('express');
const router = express.Router();
const recepcionController = require('../controllers/recepcionController');

// --- Rutas Públicas ---
router.get('/buscar/qc/:n_control_qc', recepcionController.getRecepcionByQC);
// 1. Rutas específicas PRIMERO
router.get('/next-qc', recepcionController.getNextQC);
router.post('/completa', recepcionController.crearRecepcionCompleta);
// 2. Rutas generales después
router.get('/', recepcionController.obtenerRecepciones);

// 3. Rutas con parámetros (ID) AL FINAL
router.get('/:id', recepcionController.getRecepcionById);

module.exports = router;