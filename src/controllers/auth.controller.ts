import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = await AuthService.login(req.body);
      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  }

  async logOut(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.logOut();
      res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
