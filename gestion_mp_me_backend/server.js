const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- LOGGER (El "Chismoso") ---
// Esto nos mostrará en la terminal cada petición que llega
app.use(cors({
    origin: 'http://localhost:5500' // O la URL de tu frontend
}));

// --- MIDDLEWARES ---
// Configuración de CORS para permitir que el frontend se conecte
app.use(cors());
app.use(express.json());

// --- RUTAS (ENDPOINTS) ---
const recepcionRoutes = require('./src/routes/recepcionRoutes');
app.use('/api/recepciones', recepcionRoutes);

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

// --- LA RUTA NUEVA QUE ESTABA FALLANDO ---
const ingresoMovimientoRoutes = require('./src/routes/ingresoMovimientoRoutes.js');
app.use('/api/ingreso-movimiento', ingresoMovimientoRoutes);
// ----------------------------------------

// Ruta de prueba general
app.get('/', (req, res) => {
  res.send('API del Módulo MP / ME funcionando correctamente!');
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`--- Servidor corriendo en el puerto ${PORT} ---`);
});