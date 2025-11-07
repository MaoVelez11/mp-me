const Recepcion = require('../models/recepcionModel');
const Movimiento = require('../models/movimientoModel');
const emailService = require('../services/emailService');

// POST /api/correos/recepcion/:id
exports.enviarCorreoRecepcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body; 

    if (!email) {
      return res.status(400).json({ message: 'El correo del destinatario es requerido.' });
    }

    const recepcion = await Recepcion.getById(id);
    if (!recepcion) {
      return res.status(404).json({ message: 'Recepción no encontrada.' });
    }

    await emailService.sendReceptionEmail(recepcion, recepcion.n_control_qc, email);

    res.status(200).json({ message: 'Correo de recepción enviado exitosamente.' });
  
  } catch (error) {
    console.error('Error al enviar correo de recepción:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// POST /api/correos/movimiento/:id
exports.enviarCorreoMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body; 

    if (!email) {
      return res.status(400).json({ message: 'El correo del destinatario es requerido.' });
    }

    const movimiento = await Movimiento.getById(id);
    if (!movimiento) {
      return res.status(404).json({ message: 'Movimiento no encontrado.' });
    }

    await emailService.sendMovementEmail(movimiento, email);

    res.status(200).json({ message: 'Correo de movimiento enviado exitosamente.' });
  
  } catch (error) {
    console.error('Error al enviar correo de movimiento:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};