import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private users: User[] = [];
  private sessions: Map<string, { userId: string; username: string }> =
    new Map();

  async register(
    username: string,
    password: string,
  ): Promise<{ success: boolean; message: string; user?: Partial<User> }> {
    // Check if username already exists
    if (this.users.find((user) => user.username === username)) {
      return { success: false, message: 'Username already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      username,
      password: hashedPassword,
      createdAt: new Date(),
    };

    this.users.push(newUser);

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        createdAt: newUser.createdAt,
      },
    };
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ success: boolean; message: string; user?: Partial<User> }> {
    const user = this.users.find((u) => u.username === username);

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid credentials' };
    }

    return {
      success: true,
      message: 'Login successful',
      user: { id: user.id, username: user.username, createdAt: user.createdAt },
    };
  }

  createSession(sessionId: string, userId: string, username: string): void {
    this.sessions.set(sessionId, { userId, username });
  }

  getSession(
    sessionId: string,
  ): { userId: string; username: string } | undefined {
    return this.sessions.get(sessionId);
  }

  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getUserById(userId: string): User | undefined {
    return this.users.find((user) => user.id === userId);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
