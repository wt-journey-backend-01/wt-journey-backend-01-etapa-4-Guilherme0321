import express, { Express } from 'express';
import agentesRouter from './routes/agentesRoutes';
import casosRouter from './routes/casosRoutes';
import authRouter from './routes/authRoutes';
import { errorHandler } from './utils/errorHandler';
import { swaggerUi, specs } from './docs/swagger';
import { authMiddleware } from './middlewares/authMiddleware';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app: Express = express();
const PORT: number = 3000;

app.use(express.json());

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rotas de autenticação (não protegidas)
app.use('/auth', authRouter);

// Rotas protegidas
app.use('/agentes', authMiddleware, agentesRouter);
app.use('/casos', authMiddleware, casosRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em localhost:${PORT}`);
});
