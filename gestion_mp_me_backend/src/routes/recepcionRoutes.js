const express = require('express');
const router = express.Router();
const recepcionController = require('../controllers/recepcionController');

// --- Rutas Públicas ---

// 1. Rutas específicas PRIMERO
router.get('/next-qc', recepcionController.getNextQC);

// 2. Rutas generales después
router.post('/', recepcionController.crearRecepcion);
router.get('/', recepcionController.obtenerRecepciones);

// 3. Rutas con parámetros (ID) AL FINAL
router.get('/:id', recepcionController.getRecepcionById);

module.exports = router;