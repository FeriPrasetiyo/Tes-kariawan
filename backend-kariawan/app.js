require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var createError = require("http-errors"); // Pastikan Anda menginstal 'http-errors' jika belum (npm install http-errors)

var indexRouter = require("./routes/index"); // Router utama Anda
var errorHandler = require("./middleware/errorHandler"); // Middleware penanganan error kustom Anda

var app = express();

// --- Middleware Global ---
app.use(logger("dev")); // Untuk logging permintaan
app.use(express.json()); // Penting: Untuk mengurai body permintaan JSON
app.use(express.urlencoded({ extended: false })); // Untuk mengurai body permintaan URL-encoded
app.use(cookieParser()); // Untuk mengurai cookie
app.use(express.static(path.join(__dirname, "public"))); // Untuk menyajikan file statis

// --- Melampirkan Router ---
// Semua route yang didefinisikan di indexRouter akan diproses di sini
app.use("/", indexRouter);

// --- Penanganan Error Kustom ---

// 1. Handler 404 (Not Found)
// Middleware ini akan menangkap setiap permintaan yang tidak cocok dengan route di atas.
app.use(function (req, res, next) {
  next(createError(404)); // Membuat error 404 dan meneruskannya ke middleware error handler
});

// 2. Handler Error Umum (Custom JSON Error Handler)
// Ini HARUS menjadi middleware TERAKHIR di aplikasi Anda.
// Ini akan menangkap semua error yang diteruskan oleh `next(error)` dari route atau middleware lain,
// termasuk error 404 dari handler di atas.
app.use(errorHandler); // <--- TAMBAHKAN INI: Ini adalah middleware error handler JSON Anda

module.exports = app;