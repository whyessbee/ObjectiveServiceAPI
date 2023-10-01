import express from 'express'; // Importing the Express.js framework
import mongoose from 'mongoose'; // Importing Mongoose for MongoDB interactions
import dotenv from 'dotenv'; // Importing dotenv to handle environment variables
import bodyparser from 'body-parser'; // Importing body-parser for parsing requests
import ErrorHandle from './middlewares/errorhandler.js'; // Importing custom error handling middleware
import objroute from './Route/objectiveroute.js'; // Importing custom routes for objectives
import objuserroute from './Route/objectiveuser.js'; // Importing custom routes for objective users
import logger from './middlewares/logger.js'; // Importing custom logger middleware
dotenv.config({ path: './dev.env' }); // Configuring dotenv to use a specific environment file

const app = express(); // Creating an instance of the Express app

try {
  // Middleware to parse request bodies as JSON
  app.use(bodyparser.json());

  // Middleware to log requests
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Mounting routes for objectives and objective users
  app.use("/objective", objroute);
  app.use("/user", objuserroute);

  // Error handling middleware
  app.use(ErrorHandle);

  // Connecting to MongoDB using Mongoose
  mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true });
  
  // Logging successful MongoDB connection
  mongoose.connection.once('open', () => logger.info('MongoDB Connection Established'))
    .on('error', (err) => logger.error("Error in establishing MongoDB Connection", err));

  // Starting the server and listening on the specified port or default port 3003
  app.listen(process.env.PORT || 3003, () => {
    logger.info("Express Server Listening on port " + process.env.PORT);
  });
} catch (error) {
  // Logging error during app initialization
  logger.error('Error in initialising the express app');
  throw error; // Throwing the error for further handling
}

export default app; // Exporting the Express app instance as the default export
