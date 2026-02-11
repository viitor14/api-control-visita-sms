import jwt from 'jsonwebtoken';
import User from '../models/User';

class TokenController {
  async store(req, res) {
    const { cpf = '', password = '' } = req.body;
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!cpfLimpo || !password) {
      return res.status(401).json({
        errors: ['Credenciais invalidas'],
      });
    }

    const user = await User.findOne({ where: { cpf: cpfLimpo } });

    if (!user) {
      return res.status(401).json({
        errors: ['Usuário não existe'],
      });
    }

    if (!(await user.passwordIsValid(password))) {
      return res.status(401).json({
        errors: ['Senha invalida'],
      });
    }

    const { id, nome, email, cargo, setor_id } = user;
    const token = jwt.sign({ id, email }, process.env.TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRATION,
    });

    return res.json({
      token,
      user: { nome, id, email, cargo, setor_id },
    });
  }
}

export default new TokenController();
