const IngresoMovimiento = require('../models/ingresoMovimientoModel.js');
// Nota: No importamos el 'inventarioModel' para no tocarlo.

// POST /api/ingreso-movimiento
exports.crearMovimiento = async (req, res) => {
  try {
    const movimientoData = req.body; // Espera: { referencia, producto, lote, cantidad }
    
    // Validar datos (puedes añadir más)
    if (!movimientoData.referencia || !movimientoData.producto || !movimientoData.cantidad) {
         return res.status(400).json({ message: 'Referencia, Producto y Cantidad son requeridos.' });
    }

    const resultado = await IngresoMovimiento.crear(movimientoData);

    res.status(201).json({
      message: 'Movimiento registrado exitosamente',
      id_insertado: resultado.insertId
    });

  } catch (error) {
    console.error('Error al registrar el movimiento:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// GET /api/ingreso-movimiento
exports.obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await IngresoMovimiento.obtenerTodosAbiertos();
    res.status(200).json(movimientos);
  } catch (error) {
    console.error('Error al obtener los movimientos:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// POST /api/ingreso-movimiento/cerrar-dia
exports.cerrarDia = async (req, res) => {
  try {
    const resultado = await IngresoMovimiento.cerrarDia();
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al cerrar el día:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// GET /api/ingreso-movimiento/etiquetas
exports.obtenerEtiquetas = async (req, res) => {
  try {
    const etiquetas = await IngresoMovimiento.obtenerEtiquetas();
    res.status(200).json(etiquetas);
  } catch (error) {
    console.error('Error al obtener las etiquetas:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};