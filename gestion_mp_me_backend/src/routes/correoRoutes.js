const express = require('express');
const router = express.Router();
const correoController = require('../controllers/correoController');

// Ruta única para manejar todos los envíos de correo
// POST /api/correos/enviar
router.post('/enviar', correoController.enviarCorreoGenerico);

module.exports = router;