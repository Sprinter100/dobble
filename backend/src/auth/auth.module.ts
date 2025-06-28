import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionMiddleware } from './session.middleware';

@Module({
  providers: [AuthService, SessionMiddleware],
  controllers: [AuthController],
  exports: [AuthService, SessionMiddleware],
})
export class AuthModule {}
