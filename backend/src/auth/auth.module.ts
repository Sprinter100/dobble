import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionMiddleware } from './session.middleware';
import { LocalStrategy } from './passport.strategy';
import { SessionSerializer } from './passport.serializer';
import { AuthenticatedGuard, NotAuthenticatedGuard } from './auth.guard';

@Module({
  imports: [PassportModule.register({ session: true })],
  providers: [
    AuthService,
    SessionMiddleware,
    LocalStrategy,
    SessionSerializer,
    AuthenticatedGuard,
    NotAuthenticatedGuard,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    SessionMiddleware,
    AuthenticatedGuard,
    NotAuthenticatedGuard,
  ],
})
export class AuthModule {}
