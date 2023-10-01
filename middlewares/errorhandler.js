import logger from "./logger.js";

export default function ErrorHandle (err, req, res, next) {
    //console.error(err.stack);
    logger.error(err);
    next(err);
    res.status(500).send(err.message);
  }