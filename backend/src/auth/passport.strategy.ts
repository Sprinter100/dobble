import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService, User } from './auth.service';

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super();
  }

  async validate(username: string, password: string): Promise<User | null> {
    const result = await this.authService.login(username, password);

    if (result.success && result.user) {
      return result.user as User;
    }

    return null;
  }
}
