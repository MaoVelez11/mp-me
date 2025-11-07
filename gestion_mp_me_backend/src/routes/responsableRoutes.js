const express = require('express');
const router = express.Router();
const responsableController = require('../controllers/responsableController');

// --- Rutas Públicas (YA NO HAY NINGUNA PROTEGIDA) ---

// GET /api/responsables
router.get('/', responsableController.getAllResponsables);

// POST /api/responsables
router.post('/', responsableController.createResponsable);

// DELETE /api/responsables/:id
router.delete('/:id', responsableController.deleteResponsable);

module.exports = router;