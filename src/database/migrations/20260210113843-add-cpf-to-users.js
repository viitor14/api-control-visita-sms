module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'cpf', {
      type: Sequelize.STRING(14),
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'cpf');
  },
};
