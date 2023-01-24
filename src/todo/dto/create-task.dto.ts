// taskを新規作成するときに送られてくるもの（新しいタイトルとディスクリプション）を定義

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  //   任意の値なので@IsOptionalをつける
  @IsOptional()
  description?: string;
}
