import jwt from 'jsonwebtoken';

/**
 * Verifies the JSON Web Token (JWT) sent in the Authorization header.
 * If the token is valid, the user's information is stored in the
 * request object, and the request is passed on to the next middleware
 * function.
 *
 * If the token is invalid or missing, the request is blocked with a
 * 403 Forbidden response.
 *
 * If the token is invalid for any other reason (e.g. the token's
 * signature is invalid), the request is blocked with a 500 Internal
 * Server Error response and a message indicating the problem.
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Retrieve the JWT from the Authorization header
    let token = req.header('Authorization');

    // If no token is present, block the request
    if (!token) {
      return res.status(403).send('Access Denied');
    }

    // If the token begins with "Bearer ", remove it
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    // Use the secret key we have stored in the environment
    // variables to verify the token's signature
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Store the user's information in the request object
    req.user = verified;

    // Pass the request on to the next middleware function
    next();
  } catch (err) {
    // If there was a problem with the token,
    // block the request with a 500 Internal Server Error response
    // and a message indicating the problem
    res.status(500).json({ error: err.message });
  }
};
