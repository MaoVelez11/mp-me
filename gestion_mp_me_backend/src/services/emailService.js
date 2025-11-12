const nodemailer = require('nodemailer');
const db = require('../config/database');
// --- CAMBIO AQUÍ: Importamos el modelo de configuración ---
const Configuracion = require('../models/configuracionModel');
require('dotenv').config();

// --- 1. TRANSPORTADORES DINÁMICOS ---
// Esta variable se llenará dinámicamente al iniciar el servidor
const transporters = {};

/**
 * Función que se auto-ejecuta al iniciar el servidor.
 * Lee los remitentes de la BD y crea un transportador para cada uno.
 */
(async () => {
    try {
        console.log('[EmailService] Inicializando transportadores...');
        const remitentes = await Configuracion.getRemitentes();
        
        remitentes.forEach(remitente => {
            const clave = remitente.clave; // ej: 'logistica'
            
            // Construimos dinámicamente la clave del .env
            // ej: 'EMAIL_USER_LOGISTICA' y 'EMAIL_PASS_LOGISTICA'
            const userKey = `EMAIL_USER_${clave.toUpperCase()}`;
            const passKey = `EMAIL_PASS_${clave.toUpperCase()}`;

            const user = process.env[userKey];
            const pass = process.env[passKey];

            if (user && pass) {
                // Creamos el transportador y lo guardamos en nuestro objeto
                transporters[clave] = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: process.env.EMAIL_PORT == 465,
                    auth: { user, pass }
                });
                console.log(`[EmailService] -> Remitente '${clave}' configurado.`);
            } else {
                console.warn(`[EmailService] -> ADVERTENCIA: Remitente '${clave}' encontrado en BD pero faltan credenciales ${userKey} o ${passKey} en .env`);
            }
        });
    } catch (e) {
        console.error("[EmailService] Error fatal inicializando transportadores. ¿Tablas de configuración existen?", e.message);
    }
})();

// Función para obtener la dirección "De:" correcta
const getFromAddress = async (senderKey) => {
    // Buscamos el remitente en el pool de transportadores
    if (!transporters[senderKey]) {
        // Fallback por si acaso
        const remitentes = await Configuracion.getRemitentes();
        const remitente = remitentes.find(r => r.clave === senderKey);
        if (remitente) return `"${remitente.nombre_visible}" <${remitente.email_address}>`;
    } else {
        // Usamos la configuración del .env
        const userKey = `EMAIL_USER_${senderKey.toUpperCase()}`;
        const userEmail = process.env[userKey];
        // Aquí puedes hacerlo más elegante buscando el 'nombre_visible' en la BD
        return `"Sistema de Inventario" <${userEmail}>`;
    }
    throw new Error(`Remitente '${senderKey}' no tiene credenciales en .env`);
};


// --- 2. FUNCIÓN DE LOG (Sin cambios) ---
async function logEmail(tipo, senderKey, recipients, datos, estado, errorInfo = null) {
    // (Tu función de log que te di en el Paso 2 va aquí)
    // ...
    try {
        const query = 'INSERT INTO envios_correo (tipo_correo, estado, remitente, destinatarios, datos_asociados) VALUES (?, ?, ?, ?, ?)';
        const datosLog = { ...datos, error: errorInfo ? errorInfo.message : null };
        const recipientsStr = Array.isArray(recipients) ? recipients.join(', ') : recipients;
        await db.query(query, [tipo, estado, senderKey, recipientsStr, JSON.stringify(datosLog)]);
    } catch (dbError) {
        console.error('Error FATAL: No se pudo registrar el log del correo en la BD:', dbError);
    }
}

// --- 3. PLANTILLA DE RECEPCIÓN (Modificada) ---
exports.sendReceptionEmail = async (data, senderKey, recipientList) => {
    const tipo = 'Recepción';
    const transporter = transporters[senderKey]; // Selecciona el transportador dinámico
    if (!transporter) {
        throw new Error(`Remitente '${senderKey}' no está configurado o falló al inicializar.`);
    }

    const fromAddress = await getFromAddress(senderKey);
    // ... (Tu lógica de plantilla HTML) ...
    const htmlBody = `... (Tu plantilla de recepción aquí) ...`;

    try {
        await transporter.sendMail({
            from: fromAddress,
            to: recipientList.join(', '),
            subject: `Nueva Recepción - ${data.nombre_mp_me || data.codigo_mp} (Lote: ${data.lote || 'N/A'})`,
            html: htmlBody,
        });
        await logEmail(tipo, senderKey, recipientList, data, 'Enviado');
    } catch (error) {
        console.error('Error al enviar correo de recepción:', error);
        await logEmail(tipo, senderKey, recipientList, data, 'Error', error);
        throw error;
    }
};

// --- 4. PLANTILLA DE MOVIMIENTO (Modificada) ---
exports.sendMovementEmail = async (data, senderKey, recipientList) => {
    const tipo = data.tipo_movimiento || 'Movimiento';
    const transporter = transporters[senderKey];
    if (!transporter) {
        throw new Error(`Remitente '${senderKey}' no está configurado o falló al inicializar.`);
    }

    const fromAddress = await getFromAddress(senderKey);
    // ... (Tu lógica de plantilla HTML) ...
    const htmlBody = `... (Tu plantilla de movimiento/devolución aquí) ...`;

    try {
        await transporter.sendMail({
            from: fromAddress,
            to: recipientList.join(', '),
            subject: `${tipo} - ${data.producto} (Cliente: ${data.cliente})`,
            html: htmlBody,
        });
        await logEmail(tipo, senderKey, recipientList, data, 'Enviado');
    } catch (error) {
        console.error(`Error al enviar correo de ${tipo}:`, error);
        await logEmail(tipo, senderKey, recipientList, data, 'Error', error);
        throw error;
    }
};