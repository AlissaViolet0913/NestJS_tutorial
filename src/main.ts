import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // auth.dto.tsで使用するvalidatorの機能を有効化する
  // whitelist:trueはdtoに含まれないフィールド（dtoで定義されているemail,password以外のニックネームが送られてきたときに、省いてくれる）
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000'],
  });
  app.use(cookieParser());
  // app.use(
  //   csurf({
  //     cookie: {
  //       httpOnly: true,
  //       sameSite: 'none',
  //       secure: false,
  //     },
  //     value: (req: Request) => {
  //       return req.header('csrf-token');
  //     },
  //   }),
  // );
  await app.listen(3005);
}
bootstrap();
