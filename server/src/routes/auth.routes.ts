import { Router } from 'express';

import { login, logout, register } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginSchema, registerSchema } from '../validation/auth.validation.js';

export const authRoutes = Router();

authRoutes.post('/register', validateRequest({ body: registerSchema }), register);
authRoutes.post('/login', validateRequest({ body: loginSchema }), login);
authRoutes.post('/logout', logout);
