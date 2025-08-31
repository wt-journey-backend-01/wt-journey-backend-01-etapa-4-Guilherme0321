import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import * as usuariosRepository from '../repositories/usuariosRepository';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        nome: string;
    };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token de acesso não fornecido' });
        }

        const token = authHeader.substring(7); // Remove "Bearer "
        
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não configurado');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        
        const user = await usuariosRepository.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        req.user = {
            id: user.id!,
            email: user.email,
            nome: user.nome
        };

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
