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
  app.use(
    csurf({
      // cookieの設定（set-cookieの部分）
      cookie: {
        // secretキーはjavascriptから読み込まれたくないのでtrue
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
      // valueにクライアントからリクエストヘッダーで送られてきたcsrfを渡す
      // ⇒CSRFのライブラリの中でcookieから受け取ったsecretをハッシュにかけてCSRFtokenを作成
      // ⇒生成したものとヘッダーで送られてきたCSRTtokenが一致するのか自動的に検証してくれる
      value: (req: Request) => {
        // リクエストヘッダーにcsrftokenを付与した状態でサーバーサイドに渡されるので
        // サーバーサイドで読み込む処理
        return req.header('csrf-token');
      },
    }),
  );
  // 本番環境で使用するもの：process.env.PORT 、ない場合：3005を認識
  await app.listen(process.env.PORT || 3005);
}
bootstrap();
