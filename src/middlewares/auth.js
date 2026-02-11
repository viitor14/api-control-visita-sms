import jwt from 'jsonwebtoken';
import { promisify } from 'util'; // Dica: permite usar async/await no jwt.verify
import authConfig from '../config/auth';
import User from '../models/User';

export default async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      errors: ['Login Required'],
    });
  }

  const [, token] = authorization.split(' ');

  try {
    // Dica: promisify deixa o código mais limpo que usar callback
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    const { id } = decoded;

    // Opcional: Buscar no banco garante que usuario nao foi deletado
    // Se quiser performance extrema, pode confiar só no token e remover essa busca
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(401).json({
        errors: ['Usuario não localizado ou desativado'],
      });
    }

    req.userId = id;
    req.userEmail = user.email;

    return next();
  } catch (e) {
    return res.status(401).json({
      errors: ['Token expirado ou inválido'],
    });
  }
};
