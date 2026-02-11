import Sequelize, { Model } from 'sequelize';

export default class Setor extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: Sequelize.STRING,
          defaultValue: '',
          validate: {
            len: {
              args: [2, 100],
              msg: 'Nome do setor deve ter entre 2 e 100 caracteres',
            },
          },
        },
        responsavel: {
          type: Sequelize.STRING,
          defaultValue: '',
          allowNull: true, // Opcional
        },
      },
      {
        sequelize,
        tableName: 'setores',
      },
    );
    return this;
  }

  static associate(models) {
    // Um setor recebe várias visitas
    this.hasMany(models.Visita, { foreignKey: 'setor_id', as: 'visitas' });
  }
}
