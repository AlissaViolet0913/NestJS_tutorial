// JWTをカスタマイズするためのJWPstrategyを作成
// AuthGuardがJWPのプロテクションの機能を提供。
// JWPがcookieやヘッダーに含まれる場合やJWTのsecretキー（何になるかはプロジェクトによって変わる）は、オプションをつけてカスタマイズしておく必要あり
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
// PassportStrategy:抽象クラス、抽象メソッドとしてvalidateが定義されている。（GITHUBで確認）
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // 継承しているPassportStrategyのconstructorの処理を参照
    super({
      // jwtFromRequestオプション：JWTの検証でリクエストのどこにJWTが格納されているのか指定
      jwtFromRequest: ExtractJwt.fromExtractors([
        // cookieの中からJWTを取り出す処理
        // jwt変数をセットし、クライアントからのリクエストとさらにその中にcookieが含まれている場合は、access_tokenというcookieにアクセスして値を取り出す
        // jwtにその値を格納して返す
        (req) => {
          let jwt = null;
          if (req && req.cookies) {
            jwt = req.cookies['access_token'];
          }
          return jwt;
        },
      ]),
      //   ignoreExpiration: trueにするとJWTの有効期限が切れていても有効になってしまう
      ignoreExpiration: false,
      //   JWTを生成するのにしようしたsecretのキーを指定
      //   環境変数に格納しているため、configサービスのGETメソッドを使ってsecretを取り出してこのオプションに渡す
      secretOrKey: config.get('JWT_SECRET'),
    });
  }
  // validateの実装
  //   payloadはauth.serviceのところでJWTを生成する際に使用されたもの
  //   JWTはpayloadとsecretキーをあるアルゴリズムにかけることで生成
  // 逆にJWT Tokenとsecretキーが分かればpauloadの復元が可能⇒これをやっているのがこのページ
  // JWTが正しいものか検証を行い
  //   受け取ったJWTとsecretKeyで復元したpayloadがvalidateのメソッドに渡される
  //   sub：userIdが格納されている、これを使ってprisma経由でこのidに一致するユーザー情報を取得

  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    // hashedpasswordの属性をっ削除してからreturnでユーザーオブジェクトを返す
    delete user.hashedPassword;
    return user;
  }
}

// AuthGuard：validateのメソッドの返り値のユーザーオブジェクト（JWTを解析）
// ＝ログインしているユーザーのユーザーオブジェクトをreturnで返してくれる
// このユーザーオブジェクトを自動的にリクエストに含めてくれる
// user.controllerはリクエストにアクセス⇒ユーザーんオブジェクトを取り出す
//
// このInjektableを使用できるようにするにはauth.module.tsに追記が必要
