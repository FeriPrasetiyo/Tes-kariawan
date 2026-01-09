"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Karyawan extends Model {
    static associate(models) {
      Karyawan.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "createdBy"
      });
    }
  }

  Karyawan.init(
    {
      nama: DataTypes.STRING,
      email: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      departemen: DataTypes.STRING,
      gaji: DataTypes.INTEGER,
      alamat: DataTypes.TEXT,
      tanggal_masuk: DataTypes.DATEONLY,
      status: {
      type: DataTypes.STRING,
      defaultValue: "aktif"
      },
      tanggal_resign: DataTypes.DATEONLY,
      created_by: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "Karyawan"
    }
  );

  return Karyawan;
};
