const db = require('../config/database');

const Etiqueta = {
  // Borra todas las filas de la tabla etiquetas
  borrarTodas: async (connection) => {
    const query = 'DELETE FROM etiquetas;';
    await connection.query(query);
  },

  // Inserta múltiples etiquetas basadas en los datos de la recepción
  crearVarias: async (recepcionData, idRecepcion, connection) => {
    const query = `
      INSERT INTO etiquetas (
        id_recepcion_asociada, cod_mp_me, nombre_mp_me, presentacion, 
        cantidad_peso, fecha_recepcion, responsable_qc
      ) VALUES ?;
    `;

    const etiquetasParaInsertar = [];
    for (let i = 0; i < recepcionData.total_etiquetas; i++) {
      etiquetasParaInsertar.push([
        idRecepcion,
        recepcionData.cod_mp_me,
        recepcionData.nombre_mp_me,
        recepcionData.presentacion,
        recepcionData.cantidad_peso,
        recepcionData.fecha_recepcion,
        recepcionData.responsable_qc
      ]);
    }

    // Si no hay etiquetas que crear, no hacemos nada
    if (etiquetasParaInsertar.length === 0) {
      return;
    }

    await connection.query(query, [etiquetasParaInsertar]);
  }
};

module.exports = Etiqueta;