const express = require('express');
const router = express.Router();
const responsableController = require('../controllers/responsableController');
const authMiddleware = require('../middleware/authMiddleware'); // El "guardia"

// --- Ruta Pública ---
// La necesitamos pública para que el formulario de Recepción pueda leerla
// GET /api/responsables
router.get('/', responsableController.getAllResponsables);


// --- Rutas Protegidas ---
// Solo el admin puede crear o borrar responsables

// POST /api/responsables
router.post('/', authMiddleware, responsableController.createResponsable);

// DELETE /api/responsables/:id
router.delete('/:id', authMiddleware, responsableController.deleteResponsable);

module.exports = router;