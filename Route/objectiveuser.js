import jwt from 'jsonwebtoken'; // Importing JWT for token generation
import express from 'express'; // Importing Express.js
import Authmodel from '../model/auth.js'; // Importing the authentication model
import bcrpt from 'bcrypt'; // Importing bcrypt for password hashing

const route = express.Router(); // Creating an instance of Express router

// Signin endpoint handler
const signin = (req, res, next) => {
  try {
    Authmodel.findOne({ Email: req.body.Email }).then((data, error) => {
      if (error) next(error);
      if (!data) {
        res.status(404).send({ Message: 'User Not Found' });
      }
      const isPasswordValid = bcrpt.compareSync(req.body.Password, data.Hash);
      if (!isPasswordValid) {
        res.status(401).send({ Message: 'Password Not Valid. Access cannot be granted!!!', AccssToken: null });
      }

      const token = jwt.sign({
        Email: data.Email,
        Role: data.Role
      },
        process.env.API_SECRET,
        {
          expiresIn: "1h"
        }
      );

      res.status(200).send({
        User: {
          Email: data.Email,
          Role: data.Role
        },
        Message: 'Login Successful.',
        AccessToken: token
      });
    }).catch(err => next(err));
  } catch (error) {
    next(error);
  }
};

// Signup endpoint handler
const signup = (req, res, next) => {
  try {
    let encryptedPassword = bcrpt.hashSync(req.body.Password, 8);
    let signupInfo = new Authmodel({
      Name: req.body.Name,
      Phone: req.body.Phone,
      Email: req.body.Email,
      Role: req.body.Role,
      Hash: encryptedPassword
    });

    signupInfo.save().then(data => {
      res.status(200).json({ 'Result': 'User Signed Up Successfully.' });
    }).catch((error) => next(error));
  } catch (error) {
    next(error);
  }
};

// Route for signup endpoint
route.post('/signup', signup);

// Route for signin endpoint
route.post('/signin', signin);

export default route; // Exporting the router
