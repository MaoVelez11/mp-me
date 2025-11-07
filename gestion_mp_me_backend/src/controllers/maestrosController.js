const multer = require('multer');
const exceljs = require('exceljs');
const db = require('../config/database');

const storage = multer.memoryStorage();
exports.upload = multer({ storage: storage });

// --- FUNCIÓN 1: FORMATEAR FECHAS (ROBUSTA) ---
/**
 * Formatea una entrada de fecha (string, número o Date) al formato 'AAAA-MM-DD'.
 */
function formatDateMySQL(dateInput) {
    if (!dateInput) return null;

    let date;
    
    if (typeof dateInput === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        date = new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000);
    } 
    else {
        let dateStr = String(dateInput);
        const parsableStr = dateStr.replace(/\s\(.*\)$/, '');
        date = new Date(parsableStr);
    }

    if (isNaN(date.getTime())) {
        const parts = String(dateInput).split(' ');
        if (parts.length >= 4) {
            const month = parts[1];
            const day = parts[2];
            const year = parts[3];
            date = new Date(`${month} ${day} ${year}`);
        }
    }

    if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        if (year > 1900) {
            return `${year}-${month}-${day}`;
        }
    }

    return null;
}

// --- FUNCIÓN 2: LEER CELDAS DE FORMA SEGURA ---
function getSafeValue(row, colIndex) {
    const cell = row.getCell(colIndex);
    let val = cell.value;

    if (val === null || val === undefined) return null;

    if (typeof val === 'object' && !(val instanceof Date)) {
        if (val.hasOwnProperty('result')) return val.result;
        if (val.hasOwnProperty('text')) return val.text;
        if (val.hasOwnProperty('richText')) return val.richText.map(rt => rt.text).join('');
        return val.toString();
    }

    if (typeof val === 'string' && val.trim() === '') return null;

    return val;
}

// --- FUNCIÓN 3: LÓGICA DE SUBIDA (MODIFICADA) ---
exports.subirArchivo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No se subió ningún archivo.' });
    }

    const tipoDato = req.body.tipo_dato;
    const buffer = req.file.buffer;
    let connection;

    try {
        console.log(`--- [MAESTROS] Iniciando carga de: ${tipoDato} ---`);
        connection = await db.getConnection();
        await connection.beginTransaction();

        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        let query = '';
        if (tipoDato === 'inventario') {
            await connection.query('DELETE FROM inventario');
            query = 'INSERT INTO inventario (codigo_referencia, nombre_producto, saldo, ubicacion) VALUES (?, ?, ?, ?)';
        
} else if (tipoDato === 'recepciones') {
    await connection.query('DELETE FROM recepciones');
    // Debe tener 9 nombres de columna y 9 signos '?'
    query = 'INSERT INTO recepciones (n_control_qc, cod_mp_me, nombre_mp_me, lote, fecha_recepcion, proveedor, cantidad_peso, responsable_qc, total_unidades_peso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
// ...

        } else if (tipoDato === 'movimientos') {
            await connection.query('DELETE FROM movimientos');
            query = 'INSERT INTO movimientos (referencia, producto, lote, cantidad, fecha_creacion, estado) VALUES (?, ?, ?, ?, ?, ?)';
        } else {
            throw new Error('Tipo de dato no válido.');
        }

        const dataToInsert = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) { // Omitir encabezado
                let rowData = [];

                if (tipoDato === 'inventario') {
                    rowData = [
                        getSafeValue(row, 1), getSafeValue(row, 2),
                        getSafeValue(row, 3), getSafeValue(row, 4)
                    ];
                } else if (tipoDato === 'recepciones') {
                    rowData = [
                        getSafeValue(row, 1), // n_control_qc
                        getSafeValue(row, 2), // cod_mp_me
                        getSafeValue(row, 3), // nombre_mp_me
                        getSafeValue(row, 4), // lote
                        formatDateMySQL(getSafeValue(row, 5)), // fecha_recepcion
                        getSafeValue(row, 6), // proveedor
                        getSafeValue(row, 7), // cantidad_peso
                        getSafeValue(row, 8), // responsable_qc
                        getSafeValue(row, 9)  // total_unidades_peso
                    ];
                } else if (tipoDato === 'movimientos') {
                    rowData = [
                        getSafeValue(row, 1), // referencia
                        getSafeValue(row, 2), // producto
                        getSafeValue(row, 3), // lote
                        getSafeValue(row, 4), // cantidad
                        formatDateMySQL(getSafeValue(row, 5)), // fecha_creacion
                        getSafeValue(row, 6)  // estado
                    ];
                }
                dataToInsert.push(rowData);
            }
        });

        if (dataToInsert.length === 0) throw new Error('El archivo Excel parece estar vacío.');

        console.log(`[MAESTROS] Insertando ${dataToInsert.length} filas...`);

        for (let i = 0; i < dataToInsert.length; i++) {
            const row = dataToInsert[i];
            const safeRow = row.map(v => (v === undefined ? null : v));

            try {
                await connection.query(query, safeRow);
            } catch (dbError) {
                console.error(`[ERROR SQL] Fila ${i + 2} Excel (datos enviados):`, safeRow);
                throw new Error(`Error en fila ${i + 2}: ${dbError.message}`);
            }
        }

        await connection.commit();
        console.log("[MAESTROS] ¡Éxito! Commit realizado.");
        res.status(200).json({ message: `¡Éxito! ${dataToInsert.length} registros cargados en '${tipoDato}'.` });

    } catch (error) {
        console.error("[MAESTROS ERROR]", error.message);
        if (connection) await connection.rollback();
        res.status(500).json({ message: error.message || 'Error crítico en el servidor' });
    } finally {
        if (connection) {
            connection.release();
            console.log("[MAESTROS] Conexión liberada.");
        }
    }
};