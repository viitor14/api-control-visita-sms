import { Router } from 'express';

import sessionRoutes from './sessionRoutes';
import userRoutes from './userRoutes';
import visitanteRoutes from './visitanteRoutes';
import setorRoutes from './setorRoutes';
import visitaRoutes from './visitaRoutes';

const routes = new Router();

// Aqui registramos cada grupo de rotas
routes.use(sessionRoutes);
routes.use(userRoutes);
routes.use(visitanteRoutes);
routes.use(setorRoutes);
routes.use(visitaRoutes);

export default routes;
