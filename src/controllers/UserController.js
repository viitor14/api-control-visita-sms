import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      email: Yup.string().email().required(),
      cpf: Yup.string().required(),
      password: Yup.string().required().min(6),
      cargo: Yup.string(),
      setor_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação.' });
    }

    let dadosNovoUsuario = { ...req.body };

    if (req.userId) {
      const usuarioLogado = await User.findByPk(req.userId);

      if (usuarioLogado.cargo === 'GERENTE') {
        dadosNovoUsuario.cargo = 'SETOR';
        dadosNovoUsuario.setor_id = usuarioLogado.setor_id;
        if (req.body.cargo && req.body.cargo !== 'SETOR') {
          return res.status(403).json({ error: 'Gerentes só podem criar funcionários de setor.' });
        }
      }

      if (['SETOR', 'RECEPCAO'].includes(usuarioLogado.cargo)) {
        return res.status(401).json({ error: 'Seu cargo não permite criar novos usuários.' });
      }
    }

    const userExists = await User.findOne({ where: { email: dadosNovoUsuario.email } });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe.' });
    }
    // Cria com os dados tratados (dadosNovoUsuario) e não o req.body cru
    const { id, nome, email, cargo, setor_id } = await User.create(dadosNovoUsuario);

    return res.json({ id, nome, email, cargo, setor_id });
  }

  async update(req, res) {
    // 1. Validação dos dados de entrada (Schema)
    const schema = Yup.object().shape({
      nome: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      // A senha nova só é obrigatória se o usuário informou a senha antiga
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) => (oldPassword ? field.required() : field)),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field,
      ),
      cargo: Yup.string().oneOf(['MASTER', 'RECEPCAO', 'SETOR']),
      setor_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados.' });
    }

    const { email, oldPassword, cargo, setor_id } = req.body;
    // Busca o usuário que está logado (pelo ID do token)
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado.' });
    }
    // 2. Verificação de Email
    // Se ele está tentando mudar de email, verificamos se o novo email já existe
    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }
    }

    // 3. Verificação de Senha
    // Se ele enviou 'oldPassword', quer dizer que quer mudar a senha
    if (oldPassword && !(await user.passwordIsValid(oldPassword))) {
      return res.status(401).json({ error: 'Senha antiga incorreta.' });
    }

    // 4. SEGURANÇA DE CARGOS (IMPORTANTE!) 🛡️
    // Impede que um usuário comum se promova a MASTER hackeando a API.
    // Só permitimos alterar 'cargo' se o usuário JÁ FOR 'MASTER'.
    if (cargo || setor_id) {
      if (user.cargo !== 'MASTER') {
        // Se ele não for master, removemos esses campos do objeto de atualização
        // ou lançamos erro. Aqui vou apenas ignorar a tentativa:
        delete req.body.cargo;
        delete req.body.setor_id;
      }
    }
    // 5. Atualiza no Banco
    await user.update(req.body);

    // Retorna os dados atualizados (sem a senha)
    const { id, nome, cargo: cargoAtual, setor_id: setorAtual } = user;

    return res.json({
      id,
      nome,
      email,
      cargo: cargoAtual,
      setor_id: setorAtual,
    });
  }
}

export default new UserController();
