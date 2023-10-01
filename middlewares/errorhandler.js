import logger from "./logger.js"; // Importing a logger

// Defining an error handling middleware function
export default function ErrorHandle(err, req, res, next) {
  // Log the error using the logger
  logger.error(err);

// Send a 500 Internal Server Error response to the client
  res.status(500).send(err.message);
}
