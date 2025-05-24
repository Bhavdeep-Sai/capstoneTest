const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Added space after 'Bearer'

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        req.user = decoded;
        if (roles.length > 0 && !roles.includes(decoded.role)) { // Use decoded.role
          return res.status(403).json({ message: "Access Denied" });
        }
        next();
      }
    } catch (error) {
      console.log("Error", error);
      res.status(500).json({ message: "Token is not Valid" });
    }
  }
}

module.exports = authMiddleware;