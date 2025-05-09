const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;