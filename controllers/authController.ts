import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as usuariosRepository from '../repositories/usuariosRepository';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// Schema de validação para registro
const registerSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    senha: z.string()
        .min(8, 'Senha deve ter no mínimo 8 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
            'Senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial')
});

// Schema de validação para login
const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    senha: z.string().min(1, 'Senha é obrigatória')
});

export async function register(req: Request, res: Response) {
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
        const hashedPassword = await bcrypt.hash(senha, saltRounds);

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
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: error.issues
            });
        }
        
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, senha } = validatedData;

        // Buscar usuário por email
        const user = await usuariosRepository.findByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Credenciais inválidas' });
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não configurado');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            acess_token: token
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: error.issues
            });
        }
        
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function logout(req: Request, res: Response) {
    // Como JWT é stateless, o logout é realizado no cliente removendo o token
    res.status(200).json({ message: 'Logout realizado com sucesso' });
}

export async function deleteUser(req: Request, res: Response) {
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
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
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
    } catch (error) {
        console.error('Erro ao buscar usuário atual:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
