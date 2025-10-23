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
app.use('/api/movimientos', movimientoRoutes);                     // <--- Y ESTA}

const inventarioRoutes = require('./src/routes/inventarioRoutes');
app.use('/api/inventario', inventarioRoutes);

const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes); // Cambia de /api/login a /api/users

const maestrosRoutes = require('./src/routes/maestrosRoutes');
app.use('/api/maestros', maestrosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del Módulo MP / ME funcionando correctamente!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});