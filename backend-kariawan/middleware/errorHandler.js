module.exports = (err, req, res, next) => {
  // Ambil status code dari http-errors atau custom error
  const statusCode = err.status || err.statusCode || 500;

  // Logging di server (penting untuk debugging)
  console.error("ERROR:", err.message);

  // Response ke client (JSON, konsisten)
  res.status(statusCode).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server"
  });
};
