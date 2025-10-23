const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // El "guardia"

// --- Ruta Pública ---
// POST /api/users/login
router.post('/login', userController.login);

// --- Rutas Protegidas ---
// Todas las rutas de abajo requerirán un token válido

// POST /api/users
router.post('/', authMiddleware, userController.createUser);

// GET /api/users
router.get('/', authMiddleware, userController.getAllUsers);

// PUT /api/users/:id
router.put('/:id', authMiddleware, userController.updateUserPassword);

// DELETE /api/users/:id
router.delete('/:id', authMiddleware, userController.deleteUser);


module.exports = router;