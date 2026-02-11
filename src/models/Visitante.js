import Sequelize, { Model } from 'sequelize';

export default class Visitante extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: Sequelize.STRING,
          defaultValue: '',
          validate: {
            len: {
              args: [3, 255],
              msg: 'Nome deve ter entre 3 e 255 caracteres',
            },
          },
        },
        cpf: {
          type: Sequelize.STRING,
          defaultValue: '',
          unique: {
            msg: 'CPF já cadastrado no sistema',
          },
          validate: {
            len: {
              args: [11, 14], // Aceita com ou sem pontuação
              msg: 'CPF inválido',
            },
          },
        },
        telefone: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        // Campos preparados para o futuro (Câmera/IA)
        foto_url: {
          type: Sequelize.STRING,
          defaultValue: '',
          allowNull: true,
        },
        face_descriptor: {
          // Usamos JSON para guardar o array de números da biometria
          type: Sequelize.JSON,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'visitantes',
      },
    );
    return this;
  }

  static associate(models) {
    // Um visitante pode ter várias visitas registradas
    this.hasMany(models.Visita, { foreignKey: 'visitante_id', as: 'visitas' });
  }
}
