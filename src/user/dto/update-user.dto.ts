// ユーザーの内容を更新するためのエンドポイントにクライアントからトランスファーされてくるオブジェクトをdtoとして定義する

import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nickName?: string;
}
