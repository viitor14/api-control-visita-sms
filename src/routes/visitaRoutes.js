import { Router } from 'express';
import VisitaController from '../controllers/VisitaController';

import loginRequired from '../middlewares/loginRequired';

const routes = new Router();

routes.use(loginRequired); // Protege tudo que vem abaixo.

routes.post('/', VisitaController.store); // URL Final: POST /visita/
routes.get('/', VisitaController.index); // URL Final: GET /visita/
routes.get('/:id', VisitaController.show);
routes.put('/:id', VisitaController.update); // URL Final: PUT /visita/123

export default routes;
