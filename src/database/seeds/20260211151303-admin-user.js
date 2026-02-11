const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'Administrador',
          email: 'admin@email.com',
          password_hash: await bcrypt.hash('admin123', 8), // Criptografa a senha
          cargo: 'MASTER',
          cpf: '00000000000',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'admin@email.com' }, {});
  },
};
