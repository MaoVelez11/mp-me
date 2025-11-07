const express = require('express');
const router = express.Router();
const correoController = require('../controllers/correoController');

// --- Rutas Públicas (YA NO HAY NINGUNA PROTEGIDA) ---

// POST /api/correos/recepcion/:id
router.post('/recepcion/:id', correoController.enviarCorreoRecepcion);

// POST /api/correos/movimiento/:id
router.post('/movimiento/:id', correoController.enviarCorreoMovimiento);

module.exports = router;