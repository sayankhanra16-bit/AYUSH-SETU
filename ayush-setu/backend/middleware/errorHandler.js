// Central error handler. Mount this LAST, after all routes, in server.js.
// Any route can just call next(err) or throw inside an async handler wrapped
// in a try/catch that calls next(err), and it lands here instead of crashing
// the server or leaking a raw stack trace to the client.
module.exports = function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);

  // Mongoose duplicate key error (e.g. duplicate email, or duplicate application)
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate entry — this record already exists.' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server.',
  });
};
