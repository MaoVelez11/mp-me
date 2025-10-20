const db = require('../config/database');
const Movimiento = require('../models/movimientoModel');
const Inventario = require('../models/inventarioModel');

// --- Función para registrar un nuevo movimiento ---
exports.crearMovimiento = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const nuevoMovimiento = req.body;

    // 1. Buscar el producto en inventario
    const productoInventario = await Inventario.buscarOCrear(
      nuevoMovimiento.referencia,
      nuevoMovimiento.producto,
      connection
    );

    // 2. Validar si hay stock suficiente
    const cantidadConsumida = parseFloat(nuevoMovimiento.cantidad);
    if (parseFloat(productoInventario.saldo) < cantidadConsumida) {
      throw new Error('No hay saldo suficiente en el inventario para este movimiento.');
    }

    // 3. Calcular el nuevo saldo y actualizarlo
    const nuevoSaldo = parseFloat(productoInventario.saldo) - cantidadConsumida;
    await Inventario.actualizarSaldo(nuevoMovimiento.referencia, nuevoSaldo, connection);

    // 4. Registrar el movimiento en la bitácora
    const resultado = await Movimiento.crear(nuevoMovimiento, connection);

    await connection.commit();

    res.status(201).json({
      message: 'Movimiento registrado e inventario actualizado exitosamente',
      id_insertado: resultado.insertId
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al registrar el movimiento:', error);
    res.status(500).json({ message: error.message || 'Error en el servidor' });
  } finally {
    if (connection) connection.release();
  }
};

// --- Función para obtener todos los movimientos ---
exports.obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.obtenerTodos();
    res.status(200).json(movimientos);
  } catch (error) {
    console.error('Error al obtener los movimientos:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};