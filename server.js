"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agentesRoutes_1 = __importDefault(require("./routes/agentesRoutes"));
const casosRoutes_1 = __importDefault(require("./routes/casosRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const errorHandler_1 = require("./utils/errorHandler");
const swagger_1 = require("./docs/swagger");
const authMiddleware_1 = require("./middlewares/authMiddleware");
const dotenv_1 = __importDefault(require("dotenv"));
// Carregar variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
// Swagger Documentation
app.use('/docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs));
// Rotas de autenticação (não protegidas)
app.use('/auth', authRoutes_1.default);
// Rotas protegidas
app.use('/agentes', authMiddleware_1.authMiddleware, agentesRoutes_1.default);
app.use('/casos', authMiddleware_1.authMiddleware, casosRoutes_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em localhost:${PORT}`);
});
