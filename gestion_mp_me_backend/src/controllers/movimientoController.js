const Movimiento = require('../models/movimientoModel');
const Inventario = require('../models/inventarioModel');
const emailService = require('../services/emailService');

// POST /api/movimientos
exports.crearMovimiento = async (req, res) => {
  try {
    const movimientoData = req.body;

    // 1. Guardar el nuevo movimiento
    // (El modelo maneja su propia conexión internamente)
    const resultado = await Movimiento.crear(movimientoData);

    // 2. Actualizar el inventario MAESTRO (Restar)
    // Usamos Math.abs para asegurar que restamos una cantidad positiva
    const cantidadRestar = -Math.abs(parseFloat(movimientoData.cantidad));
    
    // ¡AQUÍ ESTABA EL ERROR! Pasamos 'null' como último argumento.
    await Inventario.actualizarStock(
        movimientoData.referencia,
        movimientoData.producto,
        cantidadRestar,
        movimientoData.ubicacion || null,
        movimientoData.bodega || null,
        null // <--- IMPORTANTE: 'null' en lugar de 'connection'
    );

    // 3. Enviar correo (si aplica)
    try {
      // Añadimos datos ficticios si faltan, para que el correo no falle
      const datosCorreo = {
        ...movimientoData,
        tipo_movimiento: movimientoData.tipo_movimiento || "Movimiento",
        cliente: movimientoData.cliente || "N/A"
      };
      // NOTA: Si quieres enviar a un correo específico, deberías recibirlo del frontend
      // Por ahora, usa un correo fijo o el del .env si lo prefieres para pruebas automáticas.
      await emailService.sendMovementEmail(datosCorreo, "destinatario_fijo@ejemplo.com"); 
    } catch (emailError) {
      console.error("Advertencia: Falló el envío de correo automático:", emailError.message);
    }

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
    console.log("[DEBUG] Iniciando obtenerMovimientos..."); // <--- LOG 1
    
    const movimientos = await Movimiento.obtenerTodos();
    
    console.log("[DEBUG] Datos obtenidos de la BD:", movimientos.length); // <--- LOG 2
    
    res.status(200).json(movimientos);
    console.log("[DEBUG] Respuesta enviada al frontend."); // <--- LOG 3

  } catch (error) {
    console.error('[DEBUG] ERROR en obtenerMovimientos:', error); // <--- LOG ERROR
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