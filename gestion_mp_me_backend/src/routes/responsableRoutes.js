const express = require('express');
const router = express.Router();
const responsableController = require('../controllers/responsableController');

// Ruta que ya tenías (para cargar el dropdown en recepcion.html)
router.get('/', responsableController.getAllResponsables);

// --- NUEVA RUTA ---
// Para crear un responsable desde configuracion.html
router.post('/', responsableController.crearResponsable);

// --- NUEVA RUTA ---
// Para eliminar un responsable desde configuracion.html
router.delete('/:id', responsableController.eliminarResponsable);

module.exports = router;