const db = require('../config/database');

const Configuracion = {
    // --- REMITENTES (Quién envía) ---
    
    /**
     * Obtiene todos los remitentes configurados.
     */
    getRemitentes: async () => {
        const [rows] = await db.query('SELECT * FROM config_remitentes ORDER BY clave');
        return rows;
    },

    /**
     * Agrega un nuevo remitente.
     * @param {object} data - { clave, nombre_visible, email_address }
     */
    addRemitente: async (data) => {
        const { clave, nombre_visible, email_address } = data;
        const query = 'INSERT INTO config_remitentes (clave, nombre_visible, email_address) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [clave, nombre_visible, email_address]);
        return result.insertId;
    },

    /**
     * Elimina un remitente por su ID.
     * @param {number} id 
     */
    deleteRemitente: async (id) => {
        await db.query('DELETE FROM config_remitentes WHERE id = ?', [id]);
    },

    // --- DESTINATARIOS (Para quién) ---
    
    /**
     * Obtiene todos los destinatarios configurados.
     */
    getDestinatarios: async () => {
        const [rows] = await db.query('SELECT * FROM config_destinatarios ORDER BY tipo_correo, email_address');
        return rows;
    },

    /**
     * Agrega un nuevo destinatario.
     * @param {object} data - { tipo_correo, email_address, descripcion }
     */
    addDestinatario: async (data) => {
        const { tipo_correo, email_address, descripcion } = data;
        const query = 'INSERT INTO config_destinatarios (tipo_correo, email_address, descripcion) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [tipo_correo, email_address, descripcion || null]);
        return result.insertId;
    },

    /**
     * Elimina un destinatario por su ID.
     * @param {number} id 
     */
    deleteDestinatario: async (id) => {
        await db.query('DELETE FROM config_destinatarios WHERE id = ?', [id]);
    }
};

module.exports = Configuracion;