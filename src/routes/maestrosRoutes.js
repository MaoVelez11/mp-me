const express = require('express');
const router = express.Router();
const maestrosController = require('../controllers/maestrosController');
const authMiddleware = require('../middleware/authMiddleware'); // El "guardia"

// POST /api/maestros/upload
router.post(
  '/upload', 
  authMiddleware, // 1. Verifica el token
  maestrosController.upload.single('archivoExcel'), // 2. Procesa el archivo
  maestrosController.subirArchivo // 3. Ejecuta nuestra lógica
);

module.exports = router;