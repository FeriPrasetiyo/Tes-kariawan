const createError = require("http-errors");

function isAdmin(req, res, next) {
  // authentication middleware harus dijalankan dulu
  if (req.user && req.user.is_admin) {
    return next();
  }

  // Forbidden → ditangani oleh errorHandler
  return next(
    createError(
      403,
      "Anda tidak memiliki izin untuk melakukan tindakan ini. Akses ditolak."
    )
  );
}

module.exports = isAdmin;
