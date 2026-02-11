import { Router } from 'express';
import VisitanteController from '../controllers/VisitanteController';
import loginRequired from '../middlewares/loginRequired';

const routes = new Router();

routes.use(loginRequired); // Protege todas as rotas abaixo

routes.post('/', VisitanteController.store);
routes.get('/:cpf', VisitanteController.show);
routes.get('/', VisitanteController.index);
routes.post('/buscar', VisitanteController.buscarPorCpf);

export default routes;
