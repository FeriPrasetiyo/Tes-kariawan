var express = require("express");
var router = express.Router();
const authentication = require("../middleware/outh");
const isAdminOrOwner = require("../middleware/isAdminOrOwner");
const isAdmin = require("../middleware/isAdmin");
const controller = require("../controller");
const karyawanController = require("../controller/karyawan.controller");
const dashboardController = require("../controller/dashboard.controller");



// Endpoint publik (tidak memerlukan otentikasi)
router.post("/users/register", controller.register);
router.post("/users/login", controller.login);

// Terapkan middleware otentikasi untuk semua route di bawah ini
router.use(authentication);

// Endpoint yang dilindungi oleh otentikasi
// PATCH /users/:id (Hanya admin yang bisa update pengguna lain)
router.patch("/users/:id", isAdminOrOwner, controller.update); // <-- Tambahkan isAdmin di sini
// DELETE /users/:id (Hanya admin yang bisa delete pengguna)
router.delete("/users/:id", isAdminOrOwner, controller.delete); // <-- Tambahkan isAdmin di sini

// GET /users (Mungkin hanya admin atau pengguna terotentikasi tertentu yang bisa melihat semua pengguna)
router.get("/users", isAdminOrOwner, controller.getUser); // <-- Opsional: jika hanya admin yang bisa melihat daftar lengkap
// GET /users/:id (Pengguna terotentikasi bisa melihat detail pengguna tertentu, termasuk diri sendiri)
router.get("/users/:id", isAdminOrOwner, controller.getUserId);

//kariawan 
router.post("/karyawan", isAdmin, karyawanController.create);
router.get("/karyawan", isAdmin, karyawanController.getAll);
router.get("/karyawan/:id", isAdmin, karyawanController.getById);
router.put("/karyawan/:id", isAdmin, karyawanController.update);

// List resign
router.get("/karyawan-resign", isAdmin, karyawanController.getResign);

// Resign karyawan
router.post("/karyawan/:id/resign", isAdmin, karyawanController.resign);

// Rehire / aktifkan kembali
router.post("/karyawan/:id/aktif", isAdmin, karyawanController.aktifkan);


// Edit umum
router.put("/karyawan/:id", isAdmin, karyawanController.update);

router.get("/dashboard/hrd",isAdmin,dashboardController.hrd);

router.get("/dashboard/hrd/export",isAdmin,dashboardController.exportExcel);


module.exports = router;
