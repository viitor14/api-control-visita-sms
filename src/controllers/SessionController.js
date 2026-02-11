import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      cpf: Yup.string().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação.' });
    }

    const { cpf, password } = req.body;
    const cpfLimpo = cpf.replace(/\D/g, '');
    // Verifica se o usuário existe
    const user = await User.findOne({ where: { cpf: cpfLimpo } });
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    // Verifica se a senha bate (usando o método que criamos no Model User)
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const { id, nome, email } = user;

    return res.json({
      user: {
        id,
        nome,
        email,
      },
      // Gera o Token JWT
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
