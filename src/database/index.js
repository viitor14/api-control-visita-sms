import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import User from '../models/User';
import Visita from '../models/Visita';
import Visitante from '../models/Visitante';
import Setor from '../models/Setor';
const models = [User, Visita, Visitante, Setor];

const connection = new Sequelize(databaseConfig);

/*
Connrction para usar quando for espedar no site da render.
const connection = new Sequelize(databaseConfig.url, {
  dialect: databaseConfig.dialect,
  dialectOptions: databaseConfig.dialectOptions,
  define: databaseConfig.define,
});
*/
models.forEach((model) => model.init(connection));
models.forEach((model) => model.associate && model.associate(connection.models));
