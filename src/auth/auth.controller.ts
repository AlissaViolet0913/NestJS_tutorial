import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
// 型のインポート
import { Csrf, Msg } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  // AuthServiceをDIするためにconstructorを追加
  constructor(private readonly authService: AuthService) {}

  // ユーザーを新規登録するエンドポイントの作成、postメソッド、signUp関数
  @Post('signup')
  // ＠body（bodyデコレーター）：クライアントから送られてくるリクエストbodyの内容を取り出したいときにしようする
  // 送られてくるデータはauth.dto.tsに対応したものになるので、AuthDtoの型をつける（Emailとpasswordのオブジェクト）
  signUp(@Body() dto: AuthDto): Promise<Msg> {
    // controllerはルーティング作業を記述するので、受け取ったデータをauthServiceのsignUpメソッドに渡す
    // ＝signUpの引数dtoにはemailとpasswordが渡される。返り値はsignUpと同じものにしておく
    return this.authService.signUp(dto);
  }
}
