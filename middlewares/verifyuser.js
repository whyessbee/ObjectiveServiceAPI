import jwt from 'jsonwebtoken';
import Authmodel from '../model/auth.js';

const verifyToken = (req, res, next) => {
  try {
    // Check if the request contains the 'Authorization' header with the token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0].toLowerCase() === 'jwt') {
      // Extract and verify the token
      jwt.verify(req.headers.authorization.split(' ')[1], process.env.API_SECRET, (error, decode) => {
        if (error) {
          req.Role = undefined;
          req.Email = undefined;
          next(error);
        }

        // If the token is valid, find the user in the database using the decoded email
        Authmodel.findOne({ Email: decode.Email }).then((data, err) => {
          if (data) {
            req.Role = data.Role;
            req.Email = decode.Email;
            next(); // Move to the next middleware
          } else {
            res.status(500).send(err);
          }
        }).catch((err) => {
          next(err);
        });
      });
    } else {
      req.role = undefined;
      req.email = undefined;
      next(new Error('No Token Provided')); // No token provided in the headers
    }
  } catch (error) {
    next(error);
  }
};

export default verifyToken;
