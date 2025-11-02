const Movimiento = require('../models/movimientoModel');
const Inventario = require('../models/inventarioModel'); // Asumo que el inventario maestro sigue existiendo

// POST /api/movimientos
exports.crearMovimiento = async (req, res) => {
  try {
    const movimientoData = req.body; // Espera: { referencia, producto, lote, cantidad }

    // 1. Guardar el nuevo movimiento (el modelo se encarga de la transacción)
    const resultado = await Movimiento.crear(movimientoData);

    // 2. Actualizar el inventario MAESTRO (restar la cantidad)
    // (Esta es la tabla 'inventario' que usamos para el buscador)
    const cantidadParaInventario = -Math.abs(movimientoData.cantidad); // Restar
    await Inventario.actualizarSaldo(
      movimientoData.referencia, 
      cantidadParaInventario, 
      movimientoData.ubicacion || null, // Pasamos ubicación y bodega si existen
      movimientoData.bodega || null
    );

    res.status(201).json({
      message: 'Movimiento registrado exitosamente',
      id_insertado: resultado.insertId
    });

  } catch (error) {
    console.error('Error al registrar el movimiento:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// GET /api/movimientos
exports.obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.obtenerTodos();
    res.status(200).json(movimientos);
  } catch (error) {
    console.error('Error al obtener los movimientos:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// POST /api/movimientos/cerrar-dia
exports.cerrarDia = async (req, res) => {
  try {
    const resultado = await Movimiento.cerrarDia();
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al cerrar el día:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// GET /api/movimientos/etiquetas
exports.obtenerEtiquetas = async (req, res) => {
  try {
    const etiquetas = await Movimiento.obtenerEtiquetas();
    res.status(200).json(etiquetas);
  } catch (error) {
    console.error('Error al obtener las etiquetas:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};