const db = require('../config/database');
const Recepcion = require('../models/recepcionModel');
const Etiqueta = require('../models/etiquetaModel');
const Inventario = require('../models/inventarioModel');

// --- Función para crear una nueva recepción y sus etiquetas ---
exports.crearRecepcion = async (req, res) => {
  let connection;
  try {
    // Iniciar una conexión para la transacción
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Lógica de negocio: Calcular puntaje y validar campos
    const nuevaRecepcion = req.body;
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

    // 1. Guardar la nueva recepción
    const resultadoRecepcion = await Recepcion.crear(nuevaRecepcion, connection);
    const idRecepcionInsertada = resultadoRecepcion.insertId;

    // 2. Actualizar el inventario
    const productoInventario = await Inventario.buscarOCrear(
      nuevaRecepcion.cod_mp_me,
      nuevaRecepcion.nombre_mp_me,
      connection
    );
    const cantidadRecibida = parseFloat(nuevaRecepcion.total_unidades_peso);
    const nuevoSaldo = parseFloat(productoInventario.saldo) + cantidadRecibida;
    await Inventario.actualizarSaldo(nuevaRecepcion.cod_mp_me, nuevoSaldo, connection);

    // 3. Borrar las etiquetas antiguas y crear las nuevas
    await Etiqueta.borrarTodas(connection);
    await Etiqueta.crearVarias(nuevaRecepcion, idRecepcionInsertada, connection);

    // Si todo fue exitoso, confirmamos la transacción
    await connection.commit();

    res.status(201).json({ 
      message: 'Recepción creada e inventario actualizado exitosamente', 
      id_insertado: idRecepcionInsertada 
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