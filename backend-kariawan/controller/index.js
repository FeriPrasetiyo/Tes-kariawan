const { User, Doctor, Todo } = require("../models");
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");

class Controller {
  static async register(req, res, next) {
    try {
      const { name, password, is_admin } = req.body;
      // Check if user with the same name already exists
      const checkData = await User.findOne({ where: { name } });
      if (checkData) {
        return res.json({ status: 400, message: "User is already present" });
      }
      const hashedPassword = bcrypt.hashSync(password, saltRounds);
      const data = await User.create({
        name,
        password: hashedPassword,
        is_admin,
      });
      return res.json({
        status: 201,
        message: "User registered successfully",
        data,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { name, password } = req.body;
      console.log(name,password)
      const user = await User.findOne({
        where: {
          name: name,
        },
      });
      //check Email exist
      if (!user || user.name !== name)
        return res.json({ status: 401, message: "name tidak ada" });
      // check Password
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) return res.status(401).json("password salah");
      const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET);
      res.status(201).json({ token });
    } catch (error) {
      console.log(error);
      res.status(500).json(new Response(error, false));
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params; // ID pengguna dari parameter URL
      const { name, is_admin } = req.body; // Data yang akan diperbarui dari body permintaan

      // Validasi otorisasi: Hanya admin yang bisa mengubah properti is_admin.
      // req.user.admin disetel oleh middleware otentikasi/otorisasi.
      console.log(is_admin, !req.user.admin);
      if (typeof is_admin !== "undefined" && !req.user.admin) {
        console.log(is_admin)
        const error = new Error(
          "Hanya administrator yang dapat mengubah status admin."
        );
        error.statusCode = 403; // Forbidden
        return next(error);
      }

      // Objek untuk menyimpan data yang akan diperbarui
      const updateFields = {};

      // Validasi dan siapkan objek update secara ringkas
      if (typeof name !== "undefined") {
        updateFields.name = name;
      }
      if (typeof is_admin !== "undefined") {
        updateFields.is_admin = is_admin;
      }

      // Validasi dasar: pastikan ada data yang akan diperbarui
      if (Object.keys(updateFields).length === 0) {
        const error = new Error(
          "Tidak ada data yang diberikan untuk pembaruan."
        );
        error.statusCode = 400; // Bad Request
        return next(error);
      }

      const [affectedRows] = await User.update(updateFields, {
        where: { id: id },
      });

      if (affectedRows === 0) {
        const error = new Error(`Pengguna dengan ID ${id} tidak ditemukan.`);
        error.statusCode = 404; // Not Found
        return next(error);
      }

      const updatedUser = await User.findByPk(id, {
        attributes: ["id", "name", "is_admin"],
      });

      res.status(200).json({
        message: "Pengguna berhasil diperbarui.",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error saat memperbarui pengguna:", error.message);
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params; // ID pengguna dari parameter URL

      // Lakukan penghapusan di database
      // User.destroy mengembalikan jumlah baris yang dihapus
      const deletedRows = await User.destroy({
        where: { id: id },
      });

      // Periksa apakah ada baris yang terhapus
      if (deletedRows === 0) {
        // Jika tidak ada baris yang dihapus, berarti pengguna tidak ditemukan
        const error = new Error(`Pengguna dengan ID ${id} tidak ditemukan.`);
        error.statusCode = 404; // Not Found
        return next(error);
      }

      // Kirim respons sukses
      // Biasanya, untuk operasi DELETE, respons tidak perlu menyertakan data yang dihapus
      res.status(200).json({
        message: "Pengguna berhasil dihapus.",
      });
    } catch (error) {
      // Log error untuk debugging di server
      console.error("Error saat menghapus pengguna:", error.message);
      console.error("Stack Trace:", error.stack);

      // Teruskan error ke middleware penanganan error terpusat
      // Middleware penanganan error Anda akan menentukan status kode dan pesan yang tepat
      next(error);
    }
  }

  /**
   * Mengambil daftar pengguna dengan dukungan paginasi.
   * Memerlukan otorisasi (misalnya, hanya untuk admin).
   *
   * @param {Object} req Objek permintaan Express.
   * @param {Object} res Objek respons Express.
   * @param {Function} next Fungsi middleware berikutnya.
   */

  static async getUser(req, res, next) {
    try {
      console.log("masuk data seluruh");
      // Mengambil parameter halaman dari query string, default ke 1
      const page = parseInt(req.query.page) || 1;
      // Menentukan jumlah item per halaman
      const limit = 3;
      // Menghitung offset (jumlah item yang akan dilewati)
      const offset = (page - 1) * limit;

      // Mengambil total jumlah pengguna untuk perhitungan paginasi
      const totalUsers = await User.count();
      // Menghitung total jumlah halaman
      const totalPages = Math.ceil(totalUsers / limit);

      // Mengambil data pengguna dengan limit dan offset untuk paginasi
      const users = await User.findAll({
        limit: limit,
        offset: offset,
        // Anda bisa menambahkan atribut yang ingin Anda sertakan di sini
        attributes: ["id", "name", "is_admin"], // Hindari mengirimkan password hash!
      });

      // Kirim respons sukses dengan data pengguna yang dipaginasi
      res.status(200).json({
        message: "Daftar pengguna berhasil diambil.",
        currentPage: page, // Halaman saat ini
        limit: limit, // Batas per halaman
        totalUsers: totalUsers, // Total pengguna di database
        totalPages: totalPages, // Total halaman
        data: users, // Data pengguna untuk halaman ini
      });
    } catch (error) {
      // Log error untuk debugging di server
      console.error("Error saat mengambil daftar pengguna:", error.message);
      console.error("Stack Trace:", error.stack);

      // Teruskan error ke middleware penanganan error terpusat
      // Middleware penanganan error Anda akan menentukan status kode dan pesan yang tepat
      next(error);
    }
  }

  /**
   * Mengambil detail satu pengguna berdasarkan ID.
   * Memerlukan otorisasi (misalnya, admin atau pemilik akun).
   *
   * @param {Object} req Objek permintaan Express.
   * @param {Object} res Objek respons Express.
   * @param {Function} next Fungsi middleware berikutnya.
   */
  static async getUserId(req, res, next) {
    try {
      const { id } = req.params; // Mengambil ID pengguna dari parameter URL

      // Mencari pengguna berdasarkan primary key (ID)
      const user = await User.findByPk(id, {
        attributes: ["id", "name", "is_admin"], // Pilih atribut yang ingin Anda kirim
      });

      // Periksa apakah pengguna ditemukan
      if (user) {
        // Jika ditemukan, kirim respons 200 OK dengan data pengguna
        res.status(200).json({
          message: `Pengguna dengan ID ${id} berhasil ditemukan.`,
          data: user,
        });
      } else {
        // Jika tidak ditemukan, kirim respons 404 Not Found
        const error = new Error(`Pengguna dengan ID ${id} tidak ditemukan.`);
        error.statusCode = 404; // Not Found
        return next(error); // Teruskan ke middleware penanganan error terpusat
      }
    } catch (error) {
      // Log error untuk debugging di server
      console.error(
        "Error saat mengambil pengguna berdasarkan ID:",
        error.message
      );
      console.error("Stack Trace:", error.stack);

      // Teruskan error ke middleware penanganan error terpusat
      // Middleware penanganan error Anda akan menentukan status kode dan pesan yang tepat
      next(error);
    }
  }
}

module.exports = Controller;