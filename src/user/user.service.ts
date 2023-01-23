import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ニックネームの内容を更新する処理
  async updateUser(
    // 更新時にuserIdを渡して指定する必要があるため、引数にuserID:numberを追加
    userId: number,

    // 受け取るdto、ニックネームの内容をUpdateUserDtoの形をつけて受け取れるようにする
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'hashedPassword'>> {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });
    // updateの返り値：変更されたユーザーのオブジェクトが返ってくるが、
    // importで取り込んでいるUserの型をみると返ってくるユーザーオブジェクトにはhashedPasswordが含まれてしまうのでdeleteしてからuserのオブジェクトで返す

    delete user.hashedPassword;
    return user;
  }
}
