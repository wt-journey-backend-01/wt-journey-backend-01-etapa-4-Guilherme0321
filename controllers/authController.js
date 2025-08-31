"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.deleteUser = deleteUser;
exports.getCurrentUser = getCurrentUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usuariosRepository = __importStar(require("../repositories/usuariosRepository"));
const zod_1 = require("zod");
// Schema de validação para registro
const registerSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório'),
    email: zod_1.z.string().email('Email inválido'),
    senha: zod_1.z.string()
        .min(8, 'Senha deve ter no mínimo 8 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial')
});
// Schema de validação para login
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    senha: zod_1.z.string().min(1, 'Senha é obrigatória')
});
async function register(req, res) {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { nome, email, senha } = validatedData;
        // Verificar se o email já está em uso
        const existingUser = await usuariosRepository.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email já está em uso' });
        }
        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(senha, saltRounds);
        // Criar usuário
        const newUser = await usuariosRepository.create({
            nome,
            email,
            senha: hashedPassword
        });
        // Remover senha da resposta
        const { senha: _, ...userWithoutPassword } = newUser[0];
        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: userWithoutPassword
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: error.issues
            });
        }
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
async function login(req, res) {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, senha } = validatedData;
        // Buscar usuário por email
        const user = await usuariosRepository.findByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Credenciais inválidas' });
        }
        // Verificar senha
        const isPasswordValid = await bcrypt_1.default.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Credenciais inválidas' });
        }
        // Gerar token JWT
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não configurado');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({
            acess_token: token
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: error.issues
            });
        }
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
async function logout(req, res) {
    // Como JWT é stateless, o logout é realizado no cliente removendo o token
    res.status(200).json({ message: 'Logout realizado com sucesso' });
}
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        const user = await usuariosRepository.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        await usuariosRepository.deleteById(userId);
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
async function getCurrentUser(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const user = await usuariosRepository.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        // Remover senha da resposta
        const { senha: _, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    }
    catch (error) {
        console.error('Erro ao buscar usuário atual:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
