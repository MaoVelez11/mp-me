const express = require('express');
const router = express.Router();
const maestrosController = require('../controllers/maestrosController');


// POST /api/maestros/upload
router.post(
  '/upload', 
  
  maestrosController.upload.single('archivoExcel'), // 2. Procesa el archivo
  maestrosController.subirArchivo // 3. Ejecuta nuestra lógica
);

module.exports = router;