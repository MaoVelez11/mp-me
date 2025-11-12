const db = require('../config/database');
const Recepcion = require('../models/recepcionModel');
const Etiqueta = require('../models/etiquetaModel');
const Inventario = require('../models/inventarioModel'); 

exports.crearRecepcionCompleta = async (req, res) => {
    // 1. Obtenemos los datos del "carrito" que envía el frontend (Paso 2)
    const { header, items } = req.body;

    // Validación simple
    if (!header || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Datos inválidos. Se requiere un encabezado y al menos un item.' });
    }

    let connection;
    try {
        // Obtenemos una conexión de la pool
        connection = await db.getConnection();
        // ¡Iniciamos la transacción!
        await connection.beginTransaction();

        // --- 2. INSERTAR EL ENCABEZADO (MAESTRO) ---
        // (Usamos los datos de la nueva tabla 'recepciones' de Paso 1)
        
        const headerQuery = `
            INSERT INTO recepciones (
                n_control_qc, fecha_recepcion, responsable_qc,   
                n_orden_compra, fecha_oc, tipo_insumo, placa_vehiculo, proveedor,
                calidad_producto, oportunidad_entrega, cumplimiento_parametros, servicio,
                razon_nc, tratamiento_nc
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        
        // Convertimos true/false (del frontend) a 1/0 (para la BD)
        const headerParams = [
            header.n_control_qc,
            header.fecha_recepcion,
            header.responsable_qc, 
            header.n_orden_compra,
            header.fecha_oc,
            header.tipo_insumo,
            header.placa_vehiculo,
            header.proveedor,
            header.calidad_producto ? 1 : 0,
            header.oportunidad_entrega ? 1 : 0,
            header.cumplimiento_parametros ? 1 : 0,
            header.servicio ? 1 : 0,
            header.razon_nc,
            header.tratamiento_nc
        ];

        // Ejecutamos el query y obtenemos el ID de la recepción que acabamos de crear
        const [result] = await connection.query(headerQuery, headerParams);
        const newReceptionId = result.insertId;

        if (!newReceptionId) {
            throw new Error('No se pudo crear el encabezado de la recepción.');
        }

        // --- 3. INSERTAR LOS PRODUCTOS (DETALLES) ---
        // (Usamos la nueva tabla 'recepcion_items' de Paso 1)
        
        const itemQuery = `
            INSERT INTO recepcion_items (
                id_recepcion, codigo_mp, nombre_mp, presentacion, 
                lote, fecha_vencimiento, cantidad_peso, 
                total_unidades_peso, total_etiquetas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        // Iteramos sobre el "carrito" y preparamos los inserts
        for (const item of items) {
            const itemParams = [
                newReceptionId, // <-- ¡El ID que une todo!
                item.codigo_mp,
                item.nombre_mp,
                item.presentacion,
                item.lote,
                item.fecha_vencimiento || null, // Asegurarnos que las fechas vacías sean NULL
                item.cantidad_peso,
                item.total_unidades_peso,
                item.total_etiquetas
            ];
            // Insertamos cada item uno por uno
            await connection.query(itemQuery, itemParams);
        }

        // --- 4. SI TODO SALIÓ BIEN, CONFIRMAR ---
        await connection.commit();

        res.status(201).json({ 
            message: 'Recepción y sus items guardados con éxito', 
            id: newReceptionId,
            n_control_qc: header.n_control_qc 
        });

    } catch (error) {
        // --- 5. SI ALGO FALLÓ, REVERTIR TODO ---
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al guardar recepción completa:', error);
        res.status(500).json({ message: 'Error en el servidor al guardar', error: error.message });
    
    } finally {
        // --- 6. SIEMPRE LIBERAR LA CONEXIÓN ---
        if (connection) {
            connection.release();
        }
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
exports.getRecepcionByQC = async (req, res) => {
  try {
    const { n_control_qc } = req.params;
    const recepcion = await Recepcion.getByControlQC(n_control_qc);

    if (!recepcion) {
      return res.status(404).json({ message: 'Registro no encontrado.' });
    }
    
    res.json(recepcion);

  } catch (error) {
    console.error('Error al buscar recepción por QC:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
exports.getRecepcionByQC = async (req, res) => {
  try {
    const { n_control_qc } = req.params;
    const recepcion = await Recepcion.getByControlQC(n_control_qc);

    if (!recepcion) {
      return res.status(404).json({ message: 'Registro no encontrado.' });
    }
    
    res.json(recepcion);

  } catch (error) {
    console.error('Error al buscar recepción por QC:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
