module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      // 1. Adiciona a coluna CARGO
      queryInterface.addColumn('users', 'cargo', {
        type: Sequelize.ENUM('MASTER', 'RECEPCAO', 'SETOR'),
        defaultValue: 'RECEPCAO',
        allowNull: false,
      }),
      // 2. Adiciona a coluna SETOR_ID (Vincula o usuário ao setor)
      queryInterface.addColumn('users', 'setor_id', {
        type: Sequelize.INTEGER,
        references: { model: 'setores', key: 'id' }, // Faz a chave estrangeira
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true, // Master e Recepção não precisam ter setor fixo
      }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'cargo'),
      queryInterface.removeColumn('users', 'setor_id'),
    ]);
  },
};
