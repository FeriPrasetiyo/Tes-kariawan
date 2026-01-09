const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { User } = require("../models");

async function authentication(req, res, next) {
  try {
    const authHeader = req.headers.authorization;


    // 1️⃣ Cek Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        createError(401, "Token otentikasi tidak ditemukan atau format tidak valid")
      );
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verifikasi JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Ambil user dari database
    const user = await User.findByPk(payload.id);
    if (!user) {
      return next(createError(401, "Pengguna tidak ditemukan"));
    }

    // 4️⃣ Set req.user (KONSISTEN!)
    req.user = {
      id: user.id,
      name: user.name,
      is_admin: user.is_admin
    };

    // 5️⃣ Lanjut
    next();
  } catch (error) {
    // JWT error handling
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Token telah kedaluwarsa"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(createError(401, "Token tidak valid"));
    }

    return next(createError(500, "Terjadi kesalahan saat autentikasi"));
  }
}

module.exports = authentication;
