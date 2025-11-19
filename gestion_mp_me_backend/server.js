const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const listaBlanca = [
    'http://localhost:5500',    // El que ya tenías
    'http://127.0.0.1:5500'     // El que te está dando problemas
];

const opcionesCors = {
    origin: function (origin, callback) {
        // Permitir peticiones sin 'origin' (como Postman o apps móviles)
        if (!origin) return callback(null, true);
        
        if (listaBlanca.indexOf(origin) !== -1) {
            callback(null, true); // Origen permitido
        } else {
            callback(new Error('No permitido por CORS')); // Origen bloqueado
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] // Asegúrate de permitir POST
};

app.use(cors(opcionesCors));
app.use(express.json());

// --- RUTAS (ENDPOINTS) ---
const recepcionRoutes = require('./src/routes/recepcionRoutes');
app.use('/api/recepciones', recepcionRoutes);

const configuracionRoutes = require('./src/routes/configuracionRoutes');
app.use('/api/configuracion', configuracionRoutes);

const movimientoRoutes = require('./src/routes/movimientoRoutes');
app.use('/api/movimientos', movimientoRoutes);

const inventarioRoutes = require('./src/routes/inventarioRoutes');
app.use('/api/inventario', inventarioRoutes);

const responsableRoutes = require('./src/routes/responsableRoutes');
app.use('/api/responsables', responsableRoutes);

const maestrosRoutes = require('./src/routes/maestrosRoutes');
app.use('/api/maestros', maestrosRoutes);

const correoRoutes = require('./src/routes/correoRoutes');
app.use('/api/correos', correoRoutes);

const ingresoMovimientoRoutes = require('./src/routes/ingresoMovimientoRoutes.js');
app.use('/api/ingreso-movimiento', ingresoMovimientoRoutes);


// Ruta de prueba general
app.get('/', (req, res) => {
  res.send('API del Módulo MP / ME funcionando correctamente!');
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`--- Servidor corriendo en el puerto ${PORT} ---`);
});