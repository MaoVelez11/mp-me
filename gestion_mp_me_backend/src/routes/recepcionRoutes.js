const express = require('express');
const router = express.Router();
const recepcionController = require('../controllers/recepcionController');

// Ruta para crear una nueva recepción
// POST /api/recepciones
router.post('/', recepcionController.crearRecepcion);

// Ruta para obtener todas las recepciones
// GET /api/recepciones
router.get('/', recepcionController.obtenerRecepciones); // <--- AÑADE ESTA LÍNEA

module.exports = router;