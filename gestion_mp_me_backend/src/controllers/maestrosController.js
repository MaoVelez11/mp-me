const multer = require('multer');
const exceljs = require('exceljs');
const db = require('../config/database');

// 1. Configurar Multer para guardar el archivo en la memoria (no en disco)
const storage = multer.memoryStorage();
exports.upload = multer({ storage: storage });

// 2. Función principal para subir y procesar el archivo
exports.subirArchivo = async (req, res) => {
  // El middleware de autenticación (que ya hicimos) ya protegió esta función
  
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo.' });
  }

  const tipoDato = req.body.tipo_dato; // Ej: 'inventario'
  const buffer = req.file.buffer;
  
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0]; // Tomamos la primera hoja

    const dataToInsert = [];
    let query = '';

    // Iteramos sobre cada fila del Excel
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Omitimos la fila del encabezado (fila 1)
      if (rowNumber > 1) {
        dataToInsert.push(row.values.slice(1)); // .slice(1) para quitar valores nulos al inicio
      }
    });

    if (dataToInsert.length === 0) {
      throw new Error('El archivo Excel está vacío o no tiene el formato correcto.');
    }

    // Decidimos qué hacer basándonos en la selección del formulario
    switch (tipoDato) {
      case 'inventario':
        // Borramos los datos antiguos para reemplazarlos (como pediste)
        await connection.query('DELETE FROM inventario');
        query = 'INSERT INTO inventario (codigo_referencia, nombre_producto, saldo, ubicacion) VALUES ?';
        break;
      
      case 'recepciones':
        await connection.query('DELETE FROM recepciones');
        // Asegúrate que las columnas del Excel coincidan con este orden
        query = 'INSERT INTO recepciones (n_control_qc, cod_mp_me, nombre_mp_me, /*...etc*/) VALUES ?';
        // (Nota: Esta tabla es compleja, la de inventario es un mejor ejemplo)
        break;
      
      case 'movimientos':
        await connection.query('DELETE FROM bitacora_movimientos');
        query = 'INSERT INTO bitacora_movimientos (referencia, producto, lote, cantidad, observaciones, ubicacion, bodega) VALUES ?';
        break;
        
      default:
        throw new Error('Tipo de dato no válido.');
    }

    // Ejecutamos la inserción masiva
    if (query) {
      await connection.query(query, [dataToInsert]);
    }

    // Si todo salió bien, confirmamos los cambios
    await connection.commit();
    res.status(200).json({ 
      message: `¡Éxito! Se cargaron ${dataToInsert.length} registros en la tabla '${tipoDato}'.`
    });

  } catch (error) {
    // Si algo falla, deshacemos todo
    if (connection) await connection.rollback();
    console.error('Error al procesar el archivo:', error);
    res.status(500).json({ message: error.message || 'Error en el servidor' });
  } finally {
    // Siempre liberamos la conexión
    if (connection) connection.release();
  }
};