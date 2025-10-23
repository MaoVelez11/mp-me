const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // 1. Obtener el token del encabezado 'Authorization'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  // 2. Si no hay token, denegar el acceso
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    // 3. Verificar si el token es válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Si es válido, guardar los datos del usuario en 'req' y continuar
    req.user = decoded;
    next(); // <--- Pasa al siguiente paso (el controlador real)
    
  } catch (error) {
    // 4. Si el token no es válido o expiró
    res.status(403).json({ message: 'Token no válido.' });
  }
};

module.exports = authMiddleware;