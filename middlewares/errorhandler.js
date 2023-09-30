export default function ErrorHandle (err, req, res, next) {
    console.error(err.stack);
    next(err);
    res.status(500).send(err.message);
  }