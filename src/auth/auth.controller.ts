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

  @Get('/csrf')
  getCsrfToken(@Req() req: Request): Csrf {
    return { csrfToken: req.csrfToken() };
  }

  // ユーザーを新規登録するエンドポイントの作成、postメソッド、signUp関数
  @Post('signup')
  // ＠body（bodyデコレーター）：クライアントから送られてくるリクエストbodyの内容を取り出したいときにしようする
  // 送られてくるデータはauth.dto.tsに対応したものになるので、AuthDtoの型をつける（Emailとpasswordのオブジェクト）
  signUp(@Body() dto: AuthDto): Promise<Msg> {
    // controllerはルーティング作業を記述するので、受け取ったデータをauthServiceのsignUpメソッドに渡す
    // ＝signUpの引数dtoにはemailとpasswordが渡される。返り値はsignUpと同じものにしておく
    return this.authService.signUp(dto);
  }
  // loginのエンドポイント。POSTメソッドで作成。
  // NestJSのPOSTはすべてstauts:201になってしまうが、loginはcreateするわけではないので、200のOKstatusの方が適切なので変更している。
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: AuthDto,
    // Responseの型はexpressで定義されている型を使用している
    @Res({ passthrough: true }) res: Response,
  ): Promise<Msg> {
    // loginの中の処理
    // authServiceのlogin()メソッド呼び出し。jwtを返してくれる
    const jwt = await this.authService.login(dto);
    // set-cookieの処理
    // cookieの名前はaccess_token
    // cookieの具体的な値はjwtの中にあるaccessTokenで取り出して、値として保存
    res.cookie('access_token', jwt.accessToken, {
      httpOnly: true,
      // secureはtrueにしなくちゃいけないんだけど、デプロイのときにhttpsにする必要があるので現段階はfalse
      secure: false,
      sameSite: 'none',
      path: '/',
    });
    return {
      message: 'ok',
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Msg {
    // ''空をセットすることでcoookieをリセットする、postmanの下部にあるcookiesのところのValueが空になる
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      path: '/',
    });
    return {
      message: 'ok',
    };
  }
}
