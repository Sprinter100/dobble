import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as passport from 'passport';
import { sessionMiddleware } from 'src/middlewares/session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  });

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Cookie parser middleware
  app.use(cookieParser());

  // Session middleware
  app.use(sessionMiddleware);

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  await app.listen(process.env.PORT ?? 3300);
}
void bootstrap();
