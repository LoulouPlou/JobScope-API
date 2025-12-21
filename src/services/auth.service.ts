import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from 'config';
import { UserModel } from '../models/user.model';
import { RegisterDTO, LoginDTO, IUserResponse } from '../dto/auth.dto';

export class AuthService {
  static async register(data: RegisterDTO): Promise<IUserResponse> {
    const existingUser = await UserModel.findOne({ email: data.email });

    if (existingUser) {
      const error: any = new Error('User with this email already exists');
      error.status = 409;
      error.code = 'USER_EXISTS';
      throw error;
    }

    // Hash password
    const saltRounds = config.get<number>('security.bcrypt.saltRounds') || 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await UserModel.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
    });

    return this.sanitizeUser(user);
  }

  static async login(data: LoginDTO): Promise<{ token: string; user: IUserResponse }> {
    const user = await UserModel.findOne({ email: data.email });

    if (!user) {
      const error: any = new Error('Invalid credentials');
      error.status = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      const error: any = new Error('Invalid credentials');
      error.status = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Generate JWT token
    const jwtSecret = config.get<string>('security.jwt.secret');
    const expiresIn: SignOptions['expiresIn'] = config.get('security.jwt.expiresIn');

    if (!jwtSecret) {
      throw new Error('JWT secret is not configured');
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  static async logOut(): Promise<void> {
    // For JWT, logout is handled client-side by removing the token
    return;
  }

  static sanitizeUser(user: any): IUserResponse {
    return {
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      biography: user.biography,
      interest: user.interest,
      createdAt: user.createdAt || user.created_at,
      updatedAt: user.updatedAt || user.updated_at,
    };
  }
}
