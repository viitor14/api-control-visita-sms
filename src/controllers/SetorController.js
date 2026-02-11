import * as Yup from 'yup';
import Setor from '../models/Setor';
import User from '../models/User';

class SetorController {
  async index(req, res) {
    const setores = await Setor.findAll({
      attributes: ['id', 'nome', 'responsavel'], // Retorna apenas o necessário
      order: ['id'],
    });
    return res.json(setores);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      responsavel: Yup.string(),
    });

    const userLogado = await User.findByPk(req.userId);

    if (userLogado.cargo !== 'MASTER') {
      return res.status(403).json({ error: 'Apenas usuários MASTER podem criar setores.' });
    }

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Nome do setor é obrigatório.' });
    }

    const setor = await Setor.create(req.body);
    return res.json(setor);
  }
}

export default new SetorController();
