// ビジネスロジック
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { Msg, Jwt } from './interfaces/auth.interface';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  //   ユーザーを新規作成する関数
  //   AuthDtoを受け取る、emailとpasswordのオブジェクトを受け取れるようにする
  //   返り値はprismaの非同期通信を行っていることからPromiseを指定し、成功したときにmessageの型が返ってくるので
  // <>ジェネリックスでメッセージの型を指定
  async signUp(dto: AuthDto): Promise<Msg> {
    // 受け取ったデータをハッシュ化する
    // bcrypt.hash()メソッドを使って、dtoからパスワードの属性を取り出しハッシュ化
    // hash()メソッドの第2引数にはラウンジという物を指定。以下は2の12乗。ハッシュを計算するのに4096回演算が必要。
    const hashed = await bcrypt.hash(dto.password, 12);
    // 受け取ったemailとハッシュ化されたpasswordをPrismaServiceのメソッドを使って、データベースにクリエイトしていく
    // 例外処理トライキャッチ
    try {
      //prismaサービスのメソッドを呼び出し、prisma/schema.prismaのuserテーブルに対応している。
      //createをつけることでここにデータを入れられる
      await this.prisma.user.create({
        // dataというフィールドを作ってemailとpasswordを渡す
        data: {
          email: dto.email,
          hashedPassword: hashed,
        },
      });
      //   成功した場合はメッセージで「ok」を出す
      return {
        message: 'ok',
      };
    } catch (error) {
      // prismaの操作に伴うエラーコードはPrismaClientKnownRequestErrorで定義されている（prismaのドキュメント（reference）のところに一覧が書かれている）
      if (error instanceof PrismaClientKnownRequestError) {
        // すでにあるemailで登録しようとするとエラーに。schema.prismのUserで＠uniqueをしている。
        // prismaのエラーコード一覧を参照し、p2002のUnique constraint failedである
        if (error.code === 'p2002') {
          throw new ForbiddenException('This email is already taken');
        }
      }
      // それ以外のエラーは単純にスローするよう設定
      throw error;
    }
  }

  //   loginメソッド
  // 引数でemailとpasswordをAuthのdtoとして受け取れるようにする
  async login(dto: AuthDto): Promise<Jwt> {
    // dtoからemailを取り出してemailに対応するユーザーが存在するのか検証
    // findUnique：単一のデータ取得する、該当しない場合はnull
    // findFirst：条件に一致する最初のレコードを取得
    // findMany: 条件に一致するすべてのレコードを取得
    const user = await this.prisma.user.findFirst({
      //prismaでデータを抽出するにはwhereを使用する
      where: {
        email: dto.email,
      },
    });
    // 存在しない場合の処理
    if (!user) throw new ForbiddenException('Email or password incorrect');
    // 存在した場合
    // dtoで渡されてきた平文のpasswordとデータベースの中にあるhase化されたpasswordと一致するか検証
    // bcrypt.compare()メソッドを利用。第1引数は平文、第2引数はハッシュ化されたpassword
    // 一致する場合はisValidがtrueになる
    const isValid = await bcrypt.compare(dto.password, user.hashedPassword);
    // 一致しない場合
    if (!isValid) throw new ForbiddenException('Email or password incorrect');
    // 一致した場合
    // 作成したgenerateJt()メソッドを使って、それぞれ渡し、下部にある「genearateJwt」に生成させる
    // するとaccsess tokenが返ってくるので、loginの値もaccess tokenの形になる。
    return this.generateJwt(user.id, user.email);
  }

  //   loginメソッドの中でJWTを生成するgenerateJWtというメソッドを呼び出すために定義
  // await(非同期通信)の部分があるのでPromise。auth.interface.tsで定義したJwtの型も指定
  async generateJwt(userId: number, email: string): Promise<Jwt> {
    // 受け取ったuserIdとemailを使ってJWTを生成する
    const payload = {
      sub: userId,
      email,
    };

    // 環境変数の方からJWTのSECRETを呼び出して、このSECRET変数に格納しておく
    const secret = this.config.get('JWT_SECRET');

    // payloadとsecretを使ってJWTを生成する処理
    // JWTサービスで提供されているsignAsync()メソッド
    const token = await this.jwt.signAsync(payload, {
      // 有効期限、この場合は5分
      expiresIn: '120m',
      secret: secret,
    });

    // 生成されたものをreturnで返す
    return {
      accessToken: token,
    };
  }
}
