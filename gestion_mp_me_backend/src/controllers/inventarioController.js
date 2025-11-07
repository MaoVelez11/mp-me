// src/controllers/inventarioController.js

const Inventario = require('../models/inventarioModel');

// GET /api/inventario
exports.obtenerInventario = async (req, res) => {
  try {
    const productos = await Inventario.obtenerTodo();
    res.status(200).json(productos);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// GET /api/inventario/:codigo
exports.obtenerInventarioPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const producto = await Inventario.getByCodigoReferencia(codigo);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado en inventario.' });
    }
    res.status(200).json(producto);
  } catch (error) {
    console.error('Error al obtener producto del inventario por código:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Nota: Las actualizaciones del inventario (`actualizarCantidad`) se harán
// desde los controladores de recepción y movimientos, no directamente desde aquí.