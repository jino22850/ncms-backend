const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
      
        try {
          const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
          req.Admin = decoded; 
          next(); 
        } catch (error) {
          return res.status(403).json({ message: 'Invalid or expired token.', error: error.message });
        }
      };

      // const authorize = (roles) => {
      //   return (req, res, next) => {
      //     if (!req.user || !roles.includes(req.user.role)) {
      //       return res.status(403).json({ message: "Forbidden: No permission" });
      //     }
      //     next();
      //   };
      // };
        

      module.exports = verifyToken;