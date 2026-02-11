import Sequelize, { Model } from 'sequelize';

export default class Visita extends Model {
  static init(sequelize) {
    super.init(
      {
        status: {
          type: Sequelize.ENUM('PENDENTE', 'AUTORIZADO', 'RECUSADO', 'FINALIZADO'),
          defaultValue: 'PENDENTE',
        },
        data_entrada: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        data_saida: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        obs: {
          type: Sequelize.STRING,
          defaultValue: '',
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'visitas',
      },
    );
    return this;
  }

  static associate(models) {
    // Pertence a um Visitante
    this.belongsTo(models.Visitante, { foreignKey: 'visitante_id', as: 'visitante' });

    // Pertence a um Setor (destino)
    this.belongsTo(models.Setor, { foreignKey: 'setor_id', as: 'setor' });
  }
}
