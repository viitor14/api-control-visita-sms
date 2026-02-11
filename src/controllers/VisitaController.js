import * as Yup from 'yup';
import { startOfDay, endOfDay, parseISO, isValid } from 'date-fns';
import { Op } from 'sequelize';

import Visita from '../models/Visita';
import Visitante from '../models/Visitante';
import Setor from '../models/Setor';
import User from '../models/User';

class VisitaController {
  // 1. LISTAGEM (GET)
  async index(req, res) {
    try {
      const { page = 1, limit = 8, status, data } = req.query;
      const whereGeral = {};

      const userLogado = await User.findByPk(req.userId);
      if (!userLogado) {
        return res.status(401).json({ error: 'Usuário não encontrado.' });
      }

      if (userLogado.cargo === 'SETOR' || userLogado.cargo === 'GERENTE') {
        if (!userLogado.setor_id) {
          return res.status(400).json({ error: 'Usuário com cargo restrito sem setor vinculado.' });
        }
        whereGeral.setor_id = userLogado.setor_id;
      }

      if (data) {
        const searchDate = parseISO(data);
        if (isValid(searchDate)) {
          whereGeral.data_entrada = {
            [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
          };
        }
      }

      // --- 2. BUSCA DAS ESTATÍSTICAS (Para os Cards) ---
      // Aqui usamos Promise.all para rodar 5 contagens ao mesmo tempo (muito mais rápido)
      // Note que usamos 'whereGeral', então se você filtrar a tabela por 'PENDENTE',
      // os cards de 'AUTORIZADO' continuam mostrando o valor correto.
      const [total, pendente, autorizado, finalizado, recusado] = await Promise.all([
        Visita.count({ where: whereGeral }),
        Visita.count({ where: { ...whereGeral, status: 'PENDENTE' } }),
        Visita.count({ where: { ...whereGeral, status: 'AUTORIZADO' } }),
        Visita.count({ where: { ...whereGeral, status: 'FINALIZADO' } }),
        Visita.count({ where: { ...whereGeral, status: 'RECUSADO' } }),
      ]);

      const estatisticas = { total, pendente, autorizado, finalizado, recusado };

      const whereTabela = { ...whereGeral }; // Copia as regras de data/setor

      /**
       *
      if (status && status !== 'todos') {
        whereTabela.status = status.toUpperCase();
      }
      */

      if (status) {
        // Se tiver vírgula, transforma em array. Ex: "PENDENTE,AUTORIZADO" vira ["PENDENTE", "AUTORIZADO"]
        if (status.includes(',')) {
          whereTabela.status = {
            [Op.in]: status.split(','),
          };
        } else {
          // Se for só um, mantém normal
          whereTabela.status = status;
        }
      }

      //const limit = 5; // Ajuste para 10 ou 20 em produção
      const pageNumber = parseInt(page);

      const { count, rows } = await Visita.findAndCountAll({
        where: whereTabela, // Usa o filtro específico da tabela
        limit: Number(limit),
        offset: (pageNumber - 1) * limit,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Visitante,
            as: 'visitante',
            attributes: ['id', 'nome', 'cpf', 'foto_url', 'telefone'],
          },
          {
            model: Setor,
            as: 'setor',
            attributes: ['id', 'nome', 'responsavel'],
          },
        ],
      });

      res.header('X-Total-Count', count);

      return res.json({
        lista: rows,
        estatisticas: estatisticas,
      });
    } catch (err) {
      console.error('Erro ao buscar visitas:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // 2. CADASTRO DE VISITA (POST)
  async store(req, res) {
    // Validação dos dados de entrada
    const schema = Yup.object().shape({
      visitante_id: Yup.number().required(),
      setor_id: Yup.number().required(),
      obs: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados.' });
    }

    const { visitante_id, setor_id, obs } = req.body;

    // Verificar se Setor existe
    const setorExists = await Setor.findByPk(setor_id);
    if (!setorExists) {
      return res.status(400).json({ error: 'Setor não encontrado.' });
    }

    // Verificar se Visitante existe
    const visitanteExists = await Visitante.findByPk(visitante_id);
    if (!visitanteExists) {
      return res.status(400).json({ error: 'Visitante não encontrado.' });
    }

    // REGRA DE NEGÓCIO: Verificar se a pessoa já tem uma visita em aberto
    // Não deixa criar nova visita se a anterior não foi FINALIZADA ou RECUSADA
    const visitaAberta = await Visita.findOne({
      where: {
        visitante_id,
        status: ['PENDENTE', 'AUTORIZADO'],
        data_saida: null,
      },
    });

    if (visitaAberta) {
      return res.status(400).json({
        error: 'Este visitante possui uma visita em aberto. Finalize a anterior primeiro.',
      });
    }

    // Cria a visita
    const visita = await Visita.create({
      visitante_id,
      setor_id,
      obs,
      status: 'PENDENTE', // Padrão inicial
    });

    const visitaCompleta = await Visita.findByPk(visita.id, {
      include: [
        { model: Visitante, as: 'visitante', attributes: ['nome', 'cpf', 'foto_url'] },
        { model: Setor, as: 'setor', attributes: ['nome'] },
      ],
    });

    // ---------------------------------------------------------
    // AQUI ENTRARÁ O SOCKET.IO FUTURAMENTE
    // Exemplo: req.io.to(`setor_${setor_id}`).emit('nova_visita', visitaCompleta);
    // ---------------------------------------------------------
    req.io.emit('nova_visita', visitaCompleta);

    return res.json(visitaCompleta);
  }

  // 3. ATUALIZAÇÃO / SAÍDA / APROVAÇÃO (PUT)
  async update(req, res) {
    const schema = Yup.object().shape({
      status: Yup.string().oneOf(['AUTORIZADO', 'RECUSADO', 'FINALIZADO']),
      // Removemos a validação de data_saida aqui pois o back-end que vai gerar
    });

    const { id } = req.params;
    const { status } = req.body;
    const userLogado = await User.findByPk(req.userId);

    const visita = await Visita.findByPk(id, {
      include: [{ model: Setor, as: 'setor' }],
    });

    if (!visita) {
      return res.status(400).json({ error: 'Visita não encontrada.' });
    }

    if (userLogado.cargo === 'RECEPCAO') {
      if (status === 'AUTORIZADO' || status === 'RECUSADO') {
        return res
          .status(403)
          .json({ error: 'Recepção não tem permissão para autorizar ou recusar visitas.' });
      }
    }

    if (['SETOR', 'GERENTE'].includes(userLogado.cargo)) {
      if (userLogado.setor_id !== visita.setor_id) {
        return res
          .status(403)
          .json({ error: 'Você não tem permissão para alterar visitas de outros setores.' });
      }
    }

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação.' });
    }

    // Cria um objeto cópia dos dados enviados para podermos mexer nele
    const dataToUpdate = { ...req.body };

    // --- A MÁGICA ACONTECE AQUI ---
    // Se o status for FINALIZADO, nós forçamos a data de saída para AGORA.
    if (status === 'FINALIZADO') {
      dataToUpdate.data_saida = new Date();
    }

    // Atualiza usando o objeto modificado, e não mais o req.body cru
    await visita.update(dataToUpdate);

    const visitaCompleta = await Visita.findByPk(id, {
      include: [
        {
          model: Visitante,
          as: 'visitante',
          attributes: ['id', 'nome', 'cpf', 'foto_url', 'telefone'],
        },
        {
          model: Setor,
          as: 'setor',
          attributes: ['id', 'nome'],
        },
      ],
    });

    req.io.emit('update_visita', visitaCompleta);

    return res.json(visitaCompleta);
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const userLogado = await User.findByPk(req.userId);

      // 1. Busca a visita com os dados relacionados
      const visita = await Visita.findByPk(id, {
        include: [
          {
            model: Visitante,
            as: 'visitante',
            attributes: ['id', 'nome', 'cpf', 'foto_url', 'telefone'],
          },
          {
            model: Setor,
            as: 'setor',
            attributes: ['id', 'nome', 'responsavel'],
          },
        ],
      });

      if (userLogado.cargo === 'SETOR' || userLogado.cargo === 'GERENTE') {
        if (visita.setor_id !== userLogado.setor_id) {
          return res
            .status(403)
            .json({ error: 'Você não tem permissão para visualizar visitas de outro setor.' });
        }
      }

      if (!visita) {
        return res.status(404).json({ error: 'Visita não encontrada.' });
      }

      return res.json(visita);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro interno ao buscar visita.' });
    }
  }
}

export default new VisitaController();
