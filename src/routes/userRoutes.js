import { Router } from 'express';
import UserController from '../controllers/UserController';
import loginRequired from '../middlewares/loginRequired';

const routes = new Router();

routes.use(loginRequired);

routes.post('/', UserController.store);
routes.put('/', UserController.update);

export default routes;
