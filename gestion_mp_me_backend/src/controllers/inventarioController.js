const Inventario = require('../models/inventarioModel');

// --- Función para obtener todo el inventario ---
exports.obtenerInventario = async (req, res) => {
  try {
    const inventario = await Inventario.obtenerTodo();
    res.status(200).json(inventario);

  } catch (error) {
    console.error('Error al obtener el inventario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};