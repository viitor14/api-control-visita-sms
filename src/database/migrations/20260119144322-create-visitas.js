module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('visitas', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // Chave Estrangeira para Visitantes
      visitante_id: {
        type: Sequelize.INTEGER,
        references: { model: 'visitantes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Se apagar o visitante, mantém o histórico mas com id null (ou use CASCADE para apagar tudo)
        allowNull: true,
      },
      // Chave Estrangeira para Setores
      setor_id: {
        type: Sequelize.INTEGER,
        references: { model: 'setores', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('PENDENTE', 'AUTORIZADO', 'RECUSADO', 'FINALIZADO'),
        allowNull: false,
        defaultValue: 'PENDENTE',
      },
      data_entrada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      data_saida: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      obs: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('visitas');
  },
};
