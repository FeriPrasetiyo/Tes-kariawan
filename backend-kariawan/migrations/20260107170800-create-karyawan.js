'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Karyawans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // ===== DATA KARYAWAN =====
      nama: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      jabatan: {
        type: Sequelize.STRING,
        allowNull: false
      },
      departemen: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gaji: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      alamat: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tanggal_masuk: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      // ===== RELASI KE USER (HRD) =====
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users', // NAMA TABEL (plural)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Karyawans');
  }
};
