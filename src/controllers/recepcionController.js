const db = require('../config/database');
const Recepcion = require('../models/recepcionModel');
const Etiqueta = require('../models/etiquetaModel');
const Inventario = require('../models/inventarioModel');
const emailService = require('../services/emailService');

// --- Función para crear una nueva recepción y sus etiquetas ---
exports.crearRecepcion = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const nuevaRecepcion = req.body;
    // ... (Lógica de puntaje, etc., sigue igual)
    const { calidad_producto, oportunidad_entrega, cumplimiento_parametros, servicio } = nuevaRecepcion;
    const respuestasSi = [calidad_producto, oportunidad_entrega, cumplimiento_parametros, servicio].filter(Boolean).length;
    let puntaje = 0;
    if (respuestasSi === 4) puntaje = 100.0;
    else if (respuestasSi === 3) puntaje = 75.0;
    else puntaje = 50.0;
    nuevaRecepcion.puntaje_obtenido = puntaje;
    if (respuestasSi === 4) {
      nuevaRecepcion.razon_nc = 'No Aplica';
      nuevaRecepcion.tratamiento_nc = 'No Aplica';
    }

    // 1. Guardar la nueva recepción (sin el n_control_qc)
    const resultadoRecepcion = await Recepcion.crear(nuevaRecepcion, connection);
    const idRecepcionInsertada = resultadoRecepcion.insertId;

    // --- LÓGICA DEL CONSECUTIVO AUTOMÁTICO ---
    // 2. Generar el número de control (ej: 1 -> "0001")
    const qcNumber = String(idRecepcionInsertada).padStart(4, '0');
    
    // 3. Actualizar el registro con el nuevo número de control
    await Recepcion.setControlQC(idRecepcionInsertada, qcNumber, connection);
    // ------------------------------------------

    // 4. Actualizar el inventario
    const productoInventario = await Inventario.buscarOCrear(
      nuevaRecepcion.cod_mp_me, nuevaRecepcion.nombre_mp_me, connection
    );
    const cantidadRecibida = parseFloat(nuevaRecepcion.total_unidades_peso);
    const nuevoSaldo = parseFloat(productoInventario.saldo) + cantidadRecibida;
    await Inventario.actualizarSaldo(nuevaRecepcion.cod_mp_me, nuevoSaldo, connection);

    // 5. Borrar y crear las nuevas etiquetas
    await Etiqueta.borrarTodas(connection);
    await Etiqueta.crearVarias(nuevaRecepcion, idRecepcionInsertada, connection);

    await connection.commit();

    await Inventario.actualizarCantidad(
      nuevaRecepcion.cod_mp_me,
      nuevaRecepcion.cantidad_recepcion,
      nuevaRecepcion.ubicacion,
      nuevaRecepcion.bodega
    );

    res.status(201).json({ 
      message: 'Recepción creada e inventario actualizado exitosamente', 
      id_insertado: idRecepcionInsertada,
      n_control_qc: qcNumber // Devolvemos el número creado
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error en la transacción de creación de recepción:', error);
    res.status(500).json({ message: 'Error en el servidor al crear la recepción', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};



// --- Función para obtener todas las recepciones ---
exports.obtenerRecepciones = async (req, res) => {
  try {
    const recepciones = await Recepcion.obtenerTodas();
    res.status(200).json(recepciones);
  } catch (error) {
    console.error('Error al obtener las recepciones:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// --- NUEVA FUNCIÓN: Obtener el próximo número de QC ---
exports.getNextQC = async (req, res) => {
  try {
    const data = await Recepcion.getLatestId();
    let nextId = 1; // Por defecto, si es la primera
    if (data.maxId) {
      nextId = data.maxId + 1;
    }
    const nextQC = String(nextId).padStart(4, '0');
    res.status(200).json({ nextQC: nextQC });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el próximo QC', error: error.message });
  }
  
};

exports.getRecepcionById = async (req, res) => {
  try {
    const { id } = req.params;
    const recepcion = await Recepcion.getById(id);
    if (!recepcion) {
      return res.status(404).json({ message: 'Recepción no encontrada.' });
    }
    res.status(200).json(recepcion);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
