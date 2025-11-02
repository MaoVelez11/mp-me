const Responsable = require('../models/responsableModel');

// GET /api/responsables
exports.getAllResponsables = async (req, res) => {
  try {
    const responsables = await Responsable.getAll();
    res.status(200).json(responsables);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// POST /api/responsables
exports.createResponsable = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido.' });
    }
    await Responsable.create(nombre);
    res.status(201).json({ message: 'Responsable creado exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// DELETE /api/responsables/:id
exports.deleteResponsable = async (req, res) => {
  try {
    const { id } = req.params;
    await Responsable.deleteById(id);
    res.status(200).json({ message: 'Responsable eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};