'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // 🔗 RELASI:
      // 1 User (HRD) memiliki banyak Karyawan
      User.hasMany(models.Karyawan, {
        foreignKey: 'created_by',
        as: 'karyawans'
      });
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'User'
    }
  );

  return User;
};
