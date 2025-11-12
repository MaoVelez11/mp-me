const Recepcion = require('../models/recepcionModel');
const Movimiento = require('../models/movimientoModel');
const emailService = require('../services/emailService');

// Esta es la ÚNICA función que necesitamos ahora
exports.enviarCorreoGenerico = async (req, res) => {
    
    // 1. Recibimos todos los datos del nuevo formulario
    const { tipoCorreo, recordId, senderKey, recipients } = req.body;

    // 2. Validamos los datos
    if (!tipoCorreo || !recordId || !senderKey || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ message: 'Faltan datos (tipo, id, remitente o destinatarios).' });
    }

    try {
        // 3. Decidimos qué hacer según el tipo de correo
        if (tipoCorreo === 'recepcion') {
            
            // Buscamos los datos de la recepción
            const recepcion = await Recepcion.getById(recordId);
            if (!recepcion) {
                return res.status(404).json({ message: 'Recepción no encontrada.' });
            }
            
            // Llamamos al servicio de correo de recepción
            await emailService.sendReceptionEmail(recepcion, senderKey, recipients);
        
        } else if (tipoCorreo === 'movimiento') {
            
            // Buscamos los datos del movimiento
            const movimiento = await Movimiento.getById(recordId);
            if (!movimiento) {
                return res.status(404).json({ message: 'Movimiento no encontrado.' });
            }
            
            // Llamamos al servicio de correo de movimiento
            await emailService.sendMovementEmail(movimiento, senderKey, recipients);
        
        } else {
            return res.status(400).json({ message: 'Tipo de correo no válido.' });
        }
        
        // 4. Si todo salió bien
        res.status(200).json({ message: 'Correo enviado exitosamente.' });
    
    } catch (error) {
        console.error(`Error genérico al enviar correo (${tipoCorreo}):`, error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};