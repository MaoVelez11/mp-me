const db = require('../config/database');
const Recepcion = require('../models/recepcionModel');
const Etiqueta = require('../models/etiquetaModel');
const Inventario = require('../models/inventarioModel'); 

exports.crearRecepcion = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const nuevaRecepcion = req.body;
    // ... (Lógica de puntaje)
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

    // 1. Guardar la nueva recepción (sin N° QC todavía)
    const resultadoRecepcion = await Recepcion.crear(nuevaRecepcion, connection);
    const idRecepcionInsertada = resultadoRecepcion.insertId;

    // 2. Generar el número automático basado en el ID (ej: 5 -> "0005")
    const qcNumber = String(idRecepcionInsertada).padStart(4, '0');
    
    // 3. Actualizar el registro con el número generado
    await Recepcion.setControlQC(idRecepcionInsertada, qcNumber, connection);

    // 4. (Opcional) Actualizar inventario si lo usas
    await Inventario.actualizarStock(
        nuevaRecepcion.cod_mp_me,
        nuevaRecepcion.nombre_mp_me,
        parseFloat(nuevaRecepcion.total_unidades_peso), // Cantidad positiva
        "Pendiente", // Ubicación temporal
        "Bodega Principal", // Bodega temporal
        connection
    );

    // 5. Generar etiquetas
    await Etiqueta.borrarTodas(connection);
    await Etiqueta.crearVarias(nuevaRecepcion, idRecepcionInsertada, connection);

    await connection.commit();

    res.status(201).json({ 
      message: 'Recepción creada exitosamente', 
      id_insertado: idRecepcionInsertada,
      n_control_qc: qcNumber // Devolvemos el número al frontend
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error en creación de recepción:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.obtenerRecepciones = async (req, res) => {
  try {
    const recepciones = await Recepcion.obtenerTodas();
    res.status(200).json(recepciones);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.getNextQC = async (req, res) => {
  try {
    const data = await Recepcion.getLatestId();
    let nextId = 1;
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