import * as Yup from 'yup';
import Visitante from '../models/Visitante';

class VisitanteController {
  // Cadastrar
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      cpf: Yup.string().required(),
      telefone: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação.' });
    }

    // Verifica duplicidade de CPF
    const visitanteExists = await Visitante.findOne({ where: { cpf: req.body.cpf } });

    if (visitanteExists) {
      return res.status(400).json({ error: 'Visitante já cadastrado.' });
    }

    const { id, nome, cpf, telefone } = await Visitante.create(req.body);

    return res.json({ id, nome, cpf, telefone });
  }

  async buscarPorCpf(req, res) {
    // Agora pegamos do BODY, não da Query string
    const { cpf } = req.body;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório.' });
    }

    // Busca segura no banco
    const visitante = await Visitante.findOne({
      where: { cpf },
      attributes: ['id', 'nome', 'telefone', 'foto_url'], // Retorne SÓ o necessário. Não retorne tudo.
    });

    if (!visitante) {
      return res.status(404).json({ error: 'Visitante não encontrado' });
    }

    return res.json(visitante);
  }

  async index(req, res) {
    const visitantes = await Visitante.findAll({
      attributes: ['id', 'nome', 'cpf', 'foto_url', 'telefone'],
      order: [['nome', 'ASC']],
    });

    return res.json(visitantes);
  }

  // Buscar por CPF (Para preenchimento automático)
  async show(req, res) {
    const { cpf } = req.params;

    const visitante = await Visitante.findOne({ where: { cpf } });

    if (!visitante) {
      return res.status(404).json({ error: 'Visitante não encontrado.' });
    }

    return res.json(visitante);
  }
}

export default new VisitanteController();
