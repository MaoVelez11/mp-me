const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- Rutas ---
const recepcionRoutes = require('./src/routes/recepcionRoutes');
app.use('/api/recepciones', recepcionRoutes);

const movimientoRoutes = require('./src/routes/movimientoRoutes'); // <--- AÑADE ESTA LÍNEA
app.use('/api/movimientos', movimientoRoutes);                     // <--- Y ESTA

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del Módulo MP / ME funcionando correctamente!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});