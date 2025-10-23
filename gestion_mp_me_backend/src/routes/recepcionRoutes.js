const express = require('express');
const router = express.Router();
const recepcionController = require('../controllers/recepcionController');

// ... (rutas POST y GET existentes)
router.post('/', recepcionController.crearRecepcion);
router.get('/', recepcionController.obtenerRecepciones);

// --- AÑADE ESTA LÍNEA AL FINAL ---
// GET /api/recepciones/next-qc
router.get('/next-qc', recepcionController.getNextQC);

module.exports = router;