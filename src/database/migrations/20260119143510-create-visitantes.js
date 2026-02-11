module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('visitantes', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cpf: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Garante que não duplique CPF
      },
      telefone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      foto_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      face_descriptor: {
        type: Sequelize.JSON, // Guardará o array biométrico
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('visitantes');
  },
};
