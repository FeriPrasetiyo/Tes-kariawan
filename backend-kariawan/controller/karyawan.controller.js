const ExcelJS = require("exceljs");
const createError = require("http-errors");

const { Karyawan, User, Sequelize } = require("../models");
const { Op } = Sequelize;



class KaryawanController {

  // =====================
  // CREATE KARYAWAN
  // =====================
  static async create(req, res, next) {
    try {
      const {
        nama,
        email,
        jabatan,
        departemen,
        gaji,
        alamat,
        tanggal_masuk
      } = req.body;
      console.log(req.body)
      // Validasi wajib
      if (!nama || !email || !jabatan || !gaji) {
        return next(createError(400, "Data karyawan wajib diisi"));
      }

      const data = await Karyawan.create({
        nama,
        email,
        jabatan,
        departemen,
        gaji,
        alamat,
        tanggal_masuk,
        created_by: req.user.id // HRD yang input
      });

      res.status(201).json({
        message: "Karyawan berhasil ditambahkan",
        data
      });
    } catch (error) {
      next(error);
    }
  }

  // =====================
  // GET ALL KARYAWAN
  // =====================
  static async getAll(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search?.trim();
    const status = req.query.status;
    const departemen = req.query.departemen;

    const where = {};

    // FILTER STATUS
    if (status === "aktif" || status === "resign") {
      where.status = status;
    }

    // FILTER DEPARTEMEN (STRICT)
    if (departemen) {
      where.departemen = departemen;
    }

    // SEARCH (AND dengan filter lain)
    if (search) {
      where[Op.and] = [
        {
          [Op.or]: [
            { nama: { [Op.iLike]: `%${search}%` } },
            { jabatan: { [Op.iLike]: `%${search}%` } }
          ]
        }
      ];
    }

    const { count, rows } = await Karyawan.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });

    res.json({
      page,
      limit,
      totalData: count,
      totalPages: Math.ceil(count / limit),
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

  // =====================
  // GET KARYAWAN BY ID
  // =====================
  static async getById(req, res, next) {
    try {
      const data = await Karyawan.findByPk(req.params.id, {
        include: {
          model: User,
          as: "createdBy",
          attributes: ["id", "name"]
        }
      });

      if (!data) {
        return next(createError(404, "Karyawan tidak ditemukan"));
      }

      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  // =====================
  // UPDATE KARYAWAN
  // =====================
  static async update(req, res, next) {
  try {
    const { id } = req.params;
    const {
      nama,
      email,
      jabatan,
      departemen,
      gaji,
      alamat,
      tanggal_masuk,
      tanggal_resign
    } = req.body;

    const karyawan = await Karyawan.findByPk(id);
    if (!karyawan) {
      return next(createError(404, "Karyawan tidak ditemukan"));
    }

    await karyawan.update({
      nama,
      email,
      jabatan,
      departemen,
      gaji,
      alamat,
      tanggal_masuk,
      tanggal_resign
    });

    res.json({
      message: "Data karyawan berhasil diperbarui",
      data: karyawan
    });
  } catch (error) {
    next(error);
  }
}

  // =====================
  // DELETE KARYAWAN
  // =====================
  static async resign(req, res, next) {
  try {
    const karyawan = await Karyawan.findByPk(req.params.id);
    if (!karyawan) {
      return next(createError(404, "Karyawan tidak ditemukan"));
    }

    await karyawan.update({
      status: "resign",
      tanggal_resign: new Date()
    });

    res.json({
      message: "Karyawan berhasil di-resign"
    });
  } catch (error) {
    next(error);
  }
  }

  // =====================
  // menjadi resign KARYAWAN
  // =====================


  static async getResign(req, res, next) {
  try {
    const data = await Karyawan.findAll({
      where: { status: "resign" },
      order: [["tanggal_resign", "DESC"]]
    });

    res.json({
      total: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
}
 // =====================
  // menjadi aktif KARYAWAN
  // =====================

static async aktifkan(req, res, next) {
  try {
    const karyawan = await Karyawan.findByPk(req.params.id);
    if (!karyawan) {
      return next(createError(404, "Karyawan tidak ditemukan"));
    }

    await karyawan.update({
      status: "aktif",
      tanggal_resign: null
    });

    res.json({
      message: "Karyawan berhasil diaktifkan kembali"
    });
  } catch (error) {
    next(error);
  }
}
static async exportExcel(req, res, next) {
    try {
      const year = req.query.year
        ? parseInt(req.query.year)
        : new Date().getFullYear();

      const departemen = req.query.departemen || null;

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const filterAktif = {
        status: "aktif",
        ...(departemen && { departemen })
      };

      const filterResign = {
        status: "resign",
        tanggal_resign: {
          [Op.between]: [startDate, endDate]
        },
        ...(departemen && { departemen })
      };

      // ===== DATA =====
      const aktif = await Karyawan.findAll({ where: filterAktif });
      const resign = await Karyawan.findAll({ where: filterResign });

      const departemenStat = await Karyawan.findAll({
        attributes: [
          "departemen",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "total"]
        ],
        where: filterAktif,
        group: ["departemen"]
      });

      // ===== EXCEL =====
      const workbook = new ExcelJS.Workbook();

      // 1️⃣ SUMMARY
      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.addRow(["Tahun", year]);
      summarySheet.addRow(["Departemen", departemen || "ALL"]);
      summarySheet.addRow(["Total Aktif", aktif.length]);
      summarySheet.addRow(["Total Resign", resign.length]);

      // 2️⃣ KARYAWAN AKTIF
      const aktifSheet = workbook.addWorksheet("Karyawan Aktif");
      aktifSheet.addRow([
        "Nama",
        "Email",
        "Jabatan",
        "Departemen",
        "Gaji",
        "Tanggal Masuk"
      ]);

      aktif.forEach(k => {
        aktifSheet.addRow([
          k.nama,
          k.email,
          k.jabatan,
          k.departemen,
          k.gaji,
          k.tanggal_masuk
        ]);
      });

      // 3️⃣ KARYAWAN RESIGN
      const resignSheet = workbook.addWorksheet("Karyawan Resign");
      resignSheet.addRow([
        "Nama",
        "Email",
        "Departemen",
        "Tanggal Resign"
      ]);

      resign.forEach(k => {
        resignSheet.addRow([
          k.nama,
          k.email,
          k.departemen,
          k.tanggal_resign
        ]);
      });

      // 4️⃣ STATISTIK DEPARTEMEN
      const deptSheet = workbook.addWorksheet("Statistik Departemen");
      deptSheet.addRow(["Departemen", "Total Karyawan Aktif"]);

      departemenStat.forEach(d => {
        deptSheet.addRow([d.departemen, d.dataValues.total]);
      });

      // ===== RESPONSE =====
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=dashboard-hrd-${year}-${departemen || "ALL"}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = KaryawanController;
