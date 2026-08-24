import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const extracted = clientUrl.match(/https?:\/\/[^\s,]+/g) || ['http://localhost:3000'];
  const allowedOrigins = Array.from(new Set(extracted.map(item => item.replace(/\/+$/, '').trim())));
  console.log('[CORS] Allowed origins:', allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) {
        return callback(null, true);
      }
      // Always allow localhost origins in any environment
      if (origin.startsWith('http://localhost:') || origin === 'http://localhost') {
        return callback(null, true);
      }
      // Check against allowed origins list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Reject and log the blocked origin for easy debugging
      console.error(`[CORS] Blocked origin: "${origin}" | Allowed: ${JSON.stringify(allowedOrigins)}`);
      return callback(new Error(`Not allowed by CORS`));
    },
    credentials: true,
  });

  // Body parser limit (Express-fileupload equivalent configuration if needed, handled by express platform)
  const sessionMiddleware = typeof session === 'function' ? session : (session as any)?.default;
  if (sessionMiddleware) {
    app.use(sessionMiddleware({
      secret: process.env.JWT_SECRET || 'session_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));
  }

  // Passport middlewares
  const passportInstance: any = (passport as any)?.default || passport;
  if (typeof passportInstance?.initialize === 'function') {
    app.use(passportInstance.initialize());
  }
  if (typeof passportInstance?.session === 'function') {
    app.use(passportInstance.session());
  }

  // Global filters, interceptors, and pipes
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Set global prefix excluding health endpoint
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Groovely NestJS Server running, listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API available locally at http://localhost:${port}/api`);
}
bootstrap();
