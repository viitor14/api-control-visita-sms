import { Router } from 'express';
import SetorController from '../controllers/SetorController';
//import authMiddleware from '../middlewares/auth';
import loginRequired from '../middlewares/loginRequired';

const routes = new Router();

routes.use(loginRequired); // Protege todas as rotas abaixo

routes.post('/', SetorController.store);
routes.get('/', SetorController.index);

export default routes;
