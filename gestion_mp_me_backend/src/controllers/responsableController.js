const Responsable = require('../models/responsableModel');

// Función que ya tenías
exports.getAllResponsables = async (req, res) => {
  try {
    const responsables = await Responsable.getAll();
    res.json(responsables);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// --- NUEVA FUNCIÓN ---
exports.crearResponsable = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    const newId = await Responsable.crear(nombre);
    res.status(201).json({ message: 'Responsable creado', id: newId });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// --- NUEVA FUNCIÓN ---
exports.eliminarResponsable = async (req, res) => {
  try {
    const { id } = req.params;
    await Responsable.eliminar(id);
    res.json({ message: 'Responsable eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};