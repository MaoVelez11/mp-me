const Configuracion = require('../models/configuracionModel');

// --- REMITENTES ---

exports.getRemitentes = async (req, res) => {
    try {
        const remitentes = await Configuracion.getRemitentes();
        res.json(remitentes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener remitentes', error: error.message });
    }
};

exports.addRemitente = async (req, res) => {
    try {
        const newId = await Configuracion.addRemitente(req.body);
        res.status(201).json({ message: 'Remitente agregado', id: newId });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar remitente', error: error.message });
    }
};

exports.deleteRemitente = async (req, res) => {
    try {
        await Configuracion.deleteRemitente(req.params.id);
        res.json({ message: 'Remitente eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar remitente', error: error.message });
    }
};

// --- DESTINATARIOS ---

exports.getDestinatarios = async (req, res) => {
    try {
        const destinatarios = await Configuracion.getDestinatarios();
        res.json(destinatarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener destinatarios', error: error.message });
    }
};

/**
 * Esta función especial obtiene los destinatarios y los agrupa
 * para el formulario de envío de correos.
 */
exports.getDestinatariosAgrupados = async (req, res) => {
    try {
        const todos = await Configuracion.getDestinatarios();
        
        // Agrupamos la lista plana en un objeto
        const agrupados = {
            recepcion: todos
                .filter(d => d.tipo_correo === 'recepcion')
                .map(d => d.email_address),
            movimiento: todos
                .filter(d => d.tipo_correo === 'movimiento')
                .map(d => d.email_address)
        };
        
        res.json(agrupados);
    } catch (error) {
        res.status(500).json({ message: 'Error al agrupar destinatarios', error: error.message });
    }
};


exports.addDestinatario = async (req, res) => {
    try {
        const newId = await Configuracion.addDestinatario(req.body);
        res.status(201).json({ message: 'Destinatario agregado', id: newId });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar destinatario', error: error.message });
    }
};

exports.deleteDestinatario = async (req, res) => {
    try {
        await Configuracion.deleteDestinatario(req.params.id);
        res.json({ message: 'Destinatario eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar destinatario', error: error.message });
    }
};