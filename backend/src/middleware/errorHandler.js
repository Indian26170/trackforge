const prismaErrors = {
  P2025: [404, 'Record not found.'],
  P2023: [400, 'Invalid identifier.'],
  P2003: [400, 'Related record does not exist.'],
};

module.exports = (err, req, res, next) => {
  const [status, message] = prismaErrors[err.code] || [err.status || 500, err.message];
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : message });
};