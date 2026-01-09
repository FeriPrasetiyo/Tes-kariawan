const ExcelJS = require("exceljs");
const { Karyawan, Sequelize } = require("../models");
const { Op } = Sequelize;

class DashboardController {
  static async hrd(req, res, next) {
    try {
      // Ambil query
      const year = req.query.year
        ? parseInt(req.query.year)
        : new Date().getFullYear();

      const departemen = req.query.departemen || null;

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      // ===== BASE FILTER =====
     const filterAktif = {
  tanggal_masuk: {
    [Op.lte]: endDate
  },
  [Op.or]: [
    { tanggal_resign: null },
    { tanggal_resign: { [Op.gt]: endDate } }
  ],
  ...(departemen && { departemen })
};

const filterResign = {
  tanggal_masuk: {
    [Op.lte]: endDate
  },
  tanggal_resign: {
    [Op.between]: [startDate, endDate]
  },
  ...(departemen && { departemen })
};



      // Jika departemen dikirim
      if (departemen) {
        filterAktif.departemen = departemen;
        filterResign.departemen = departemen;
      }

      // 1️⃣ Total aktif
      const totalAktif = await Karyawan.count({
        where: filterAktif
      });

      // 2️⃣ Total resign (tahun + departemen)
      const totalResign = await Karyawan.count({
        where: filterResign
      });

      // 3️⃣ Per departemen (hanya aktif)
      const perDepartemen = await Karyawan.findAll({
         attributes: [
        "departemen",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total"]
    ],
    where: {
  ...filterAktif,
  ...(departemen && { departemen })
    },
    group: ["departemen"],
    order: [["departemen", "ASC"]]
    });


      // 4️⃣ Statistik gaji (aktif)
      const gajiStat = await Karyawan.findOne({
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("gaji")), "total_gaji"],
          [Sequelize.fn("AVG", Sequelize.col("gaji")), "rata_gaji"],
          [Sequelize.fn("MAX", Sequelize.col("gaji")), "gaji_tertinggi"],
          [Sequelize.fn("MIN", Sequelize.col("gaji")), "gaji_terendah"]
        ],
        where: filterAktif
      });

      // 5️⃣ Karyawan masuk per bulan (tahun + departemen)
      const masukPerBulan = await Karyawan.findAll({
        attributes: [
          [
            Sequelize.fn(
              "DATE_TRUNC",
              "month",
              Sequelize.col("tanggal_masuk")
            ),
            "bulan"
          ],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "total"]
        ],
        where: {
          tanggal_masuk: {
            [Op.between]: [startDate, endDate]
          },
          ...(departemen && { departemen })
        },
        group: ["bulan"],
        order: [[Sequelize.literal("bulan"), "ASC"]]
      });

      // 6️⃣ DETAIL KARYAWAN AKTIF
const karyawanAktif = await Karyawan.findAll({
  where: filterAktif,
  order: [["tanggal_masuk", "ASC"]]
});

// 7️⃣ DETAIL KARYAWAN RESIGN
const karyawanResign = await Karyawan.findAll({
  where: filterResign,
  order: [["tanggal_resign", "ASC"]]
});


      res.json({
  filter: {
    year,
    departemen: departemen || "ALL"
  },
  summary: {
    total_karyawan_aktif: totalAktif,
    total_karyawan_resign: totalResign
  },
  departemen_statistik: perDepartemen,
  gaji: gajiStat,
  masuk_per_bulan: masukPerBulan,

  // 🔥 TAMBAHAN PENTING
  karyawan_aktif: karyawanAktif,
  karyawan_resign: karyawanResign
});
    } catch (error) {
      next(error);
    }
  }

  // =========================
  // EXPORT DASHBOARD KE EXCEL
  // =========================
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
  tanggal_masuk: {
    [Op.lte]: endDate
  },
  [Op.or]: [
    { tanggal_resign: null },
    { tanggal_resign: { [Op.gt]: endDate } }
  ],
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

module.exports = DashboardController;
