import dotenv from 'dotenv';
dotenv.config();

import './database';

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import homeRoutes from './routes/homeRoutes';
import userRoutes from './routes/userRoutes';
import tokenRoutes from './routes/tokenRoutes';
import sessionRoutes from './routes/sessionRoutes';
import setor from './routes/setorRoutes';
import visitante from './routes/visitanteRoutes';
import visita from './routes/visitaRoutes';

const whiteList = ['http://localhost:5173', 'http://192.168.60.181:5173'];

const corsOptions = {
  origin(origin, callback) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  exposedHeaders: ['X-Total-Count'],
};

class App {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: 'http://192.168.60.181:5173', // Em produção, troque '*' pela URL do seu front (http://localhost:3000)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
      },
    });
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors(corsOptions));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      req.io = this.io;
      next();
    });
  }

  routes() {
    this.app.use('/', homeRoutes);
    this.app.use('/users/', userRoutes);
    this.app.use('/tokens/', tokenRoutes);
    this.app.use('/sessions/', sessionRoutes);
    this.app.use('/setor/', setor);
    this.app.use('/visitante/', visitante);
    this.app.use('/visita/', visita);
  }
}

export default new App().server;
