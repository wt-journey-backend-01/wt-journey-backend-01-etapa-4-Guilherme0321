import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Registro de usuário
router.post('/register', authController.register);

// Login de usuário
router.post('/login', authController.login);

// Logout de usuário
router.post('/logout', authController.logout);

// Deletar usuário
router.delete('/users/:id', authController.deleteUser);

// Obter informações do usuário autenticado (protegida)
router.get('/usuarios/me', authMiddleware, authController.getCurrentUser);

export default router;
