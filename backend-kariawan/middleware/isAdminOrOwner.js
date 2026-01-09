const createError = require("http-errors");

function isAdminOrOwner(req, res, next) {
  const requestedId = Number(req.params.id);
  const userId = req.user.id;
  const isAdmin = req.user.is_admin;

  if (isAdmin) return next();
  if (requestedId === userId) return next();

  return next(
    createError(
      403,
      "Anda tidak memiliki izin untuk mengakses sumber daya ini."
    )
  );
}

module.exports = isAdminOrOwner;
