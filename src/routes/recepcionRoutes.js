const express = require('express');
const router = express.Router();
const recepcionController = require('../controllers/recepcionController');
const authMiddleware = require('../middleware/authMiddleware');

// ... (rutas POST y GET existentes)
router.post('/', recepcionController.crearRecepcion);
router.get('/', recepcionController.obtenerRecepciones);

// --- AÑADE ESTA LÍNEA AL FINAL ---
// GET /api/recepciones/next-qc
router.get('/next-qc', recepcionController.getNextQC);
router.get('/:id', recepcionController.getRecepcionById);
module.exports = router;