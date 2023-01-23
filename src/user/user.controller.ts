// JWTの認証をかけて有効なJWTがリクエストの中に含まれていればログインしているユーザーのユーザー情報を返すエンドポイント
// ユーザーのニックネームフィールドを作成、それを編集するためのエンドポイント

import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
// JWTのプロテクトをかけるためにimport
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
// 型
import { User } from '@prisma/client';

// @UseGuards:ユーザー関連のエンドポイントは全てJWTでプロテクトしていく（JWTによるプロテクション）。あらかじめその機能が入っていて、AuthGuardを使用する
// 引数にプロテクトをかけたいものを指定する
@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //   ログインしているユーザーのオブジェクトを取得エンドポイント
  @Get()
  // OmitでUser型からhashedPasswordの型を取り除いてものを配置
  // Requestのデータ型はexpressからimportしている（標準のものを使用）が、
  // 今回カスタマイズしているUser型に対応したデーター型が存在しないので、
  // カスタムで追加する（ディレクトリを追加し、そこで行う（suctom.d.ts））
  // jwt.strategy.tsのreturn userにアクセスしてそのまま返す
  getLoginUser(@Req() req: Request): Omit<User, 'hashedPassword'> {
    return req.user;
  }

  // ニックネームをアップデートするためのエンドポイント
  @Patch()
  updateUser(
    // リクエストとリクエストボディーを引数で受け取る
    @Req() req: Request,
    @Body() dto: UpdateUserDto,
  ): Promise<Omit<User, 'hashedPassword'>> {
    // updataUser()メソッドに渡すもの⇓
    // req.user.idでJWTから解析したログインしているユーザーのuserIdを渡す
    // dtoにはクライアントから送られてくる新しいニックネームが入る
    // ※user.service.tsで作ったupdateUser()メソッドのuserId,dtoに対応している
    return this.userService.updateUser(req.user.id, dto);
  }
}
