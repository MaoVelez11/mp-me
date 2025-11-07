// src/services/emailService.js

const nodemailer = require('nodemailer');
const db = require('../config/database');
require('dotenv').config();

// 1. Configuración del "Transporte" (sin cambios)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Función de Log en Base de Datos (sin cambios)
async function logEmail(tipo, datos, estado, errorInfo = null) {
  try {
    const query = 'INSERT INTO envios_correo (tipo_correo, estado, datos_asociados) VALUES (?, ?, ?)';
    const datosLog = {
      ...datos,
      error: errorInfo ? errorInfo.message : null,
    };
    await db.query(query, [tipo, estado, JSON.stringify(datosLog)]);
  } catch (dbError) {
    console.error('Error FATAL: No se pudo registrar el log del correo en la BD:', dbError);
  }
}

// 3. Plantilla de RECEPCIÓN (Modificada)
// --- AÑADIMOS EL PARÁMETRO: destinatarioEmail ---
exports.sendReceptionEmail = async (data, nControlQC, destinatarioEmail) => {
  const tipo = 'Recepción';
  let puntajeHtml;
  // ... (lógica de puntaje sin cambios)
  if (data.puntaje_obtenido === 100) {
    puntajeHtml = '<strong style="color: green;">APROBADO (100%)</strong>';
  } else if (data.puntaje_obtenido === 75) {
    puntajeHtml = '<strong style="color: orange;">APROBADO CON NOVEDAD (75%)</strong>';
  } else {
    puntajeHtml = `<strong style="color: red;">RECHAZADO (${data.puntaje_obtenido}%)</strong>`;
  }
  
  // Plantilla HTML (sin cambios)
  const htmlBody = `... (Tu plantilla de recepción aquí) ...`;

  try {
    await transporter.sendMail({
      from: `"Sistema de Inventario" <${process.env.EMAIL_USER}>`,
      // --- CAMBIO AQUÍ: Usamos el email del parámetro ---
      to: destinatarioEmail, 
      subject: `Nueva Recepción - ${data.nombre_mp_me} (Lote: ${data.lote})`,
      html: htmlBody,
    });
    await logEmail(tipo, data, 'Enviado');
  } catch (error) {
    console.error('Error al enviar correo de recepción:', error);
    await logEmail(tipo, data, 'Error', error);
    throw error; // Lanzamos el error para que el controlador lo atrape
  }
};

// 4. Plantilla de MOVIMIENTO (Modificada)
// --- AÑADIMOS EL PARÁMETRO: destinatarioEmail ---
exports.sendMovementEmail = async (data, destinatarioEmail) => {
  const tipo = data.tipo_movimiento;
  const fecha = new Date().toLocaleDateString('es-CO');

  // Plantilla HTML (sin cambios)
  const htmlBody = `... (Tu plantilla de movimiento/devolución aquí) ...`;

  try {
    await transporter.sendMail({
      from: `"Sistema de Inventario" <${process.env.EMAIL_USER}>`,
      // --- CAMBIO AQUÍ: Usamos el email del parámetro ---
      to: destinatarioEmail, 
      subject: `${tipo} - ${data.producto} (Cliente: ${data.cliente})`,
      html: htmlBody,
    });
    await logEmail(tipo, data, 'Enviado');
  } catch (error) {
    console.error(`Error al enviar correo de ${tipo}:`, error);
    await logEmail(tipo, data, 'Error', error);
    throw error; // Lanzamos el error para que el controlador lo atrape
  }
};