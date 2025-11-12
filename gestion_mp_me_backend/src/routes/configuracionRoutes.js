const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');

// --- Rutas para REMITENTES (Configuración) ---
router.get('/remitentes', configuracionController.getRemitentes);
router.post('/remitentes', configuracionController.addRemitente);
router.delete('/remitentes/:id', configuracionController.deleteRemitente);

// --- Rutas para DESTINATARIOS (Configuración) ---
router.get('/destinatarios', configuracionController.getDestinatarios);
router.post('/destinatarios', configuracionController.addDestinatario);
router.delete('/destinatarios/:id', configuracionController.deleteDestinatario);

// --- Ruta especial para el FORMULARIO DE ENVÍO ---
// (Devuelve los destinatarios pre-cargados)
router.get('/destinatarios/agrupados', configuracionController.getDestinatariosAgrupados);


module.exports = router;