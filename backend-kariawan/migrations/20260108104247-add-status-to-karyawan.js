"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Karyawans", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "aktif"
    });

    await queryInterface.addColumn("Karyawans", "tanggal_resign", {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Karyawans", "status");
    await queryInterface.removeColumn("Karyawans", "tanggal_resign");
  }
};
