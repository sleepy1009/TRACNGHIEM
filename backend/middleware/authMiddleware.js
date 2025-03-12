const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

    const token = authHeader.split(' ')[1]; 
    console.log("Extracted token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log("Decoded token:", decoded);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};



module.exports = authMiddleware;