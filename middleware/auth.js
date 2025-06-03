// middleware/auth.js
import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // 1. Get token from header
  const token = req.header('x-auth-token'); // Or 'Authorization' header (e.g., 'Bearer TOKEN')

  // 2. Check if no token is present
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify the token
  try {
    // jwt.verify throws an error if the token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Add the user payload (which contains the user ID) to the request object
    req.user = decoded.user;
    next(); // Pass control to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default auth;