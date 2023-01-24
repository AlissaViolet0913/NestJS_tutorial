import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  // タスクの一覧を取得
  //（prisma/schema.prismaのTaskフィールドのuserIdでどのユーザーが作ったものか分かるようにしている）
  //   userIdを作って、findManyでタスクの一覧を取得（userIdが一致するもののみ）
  //   複数なのでTask[]の型指定
  getTasks(userId: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        // 新しい順に羅列する
        createdAt: 'desc',
      },
    });
  }
  //  特定のタスクを取得（userIdと取得したいtaskId）
  //  ログインしているユーザーが作成したtaskの中でtaskIdに一致するタスクを取得する
  //  1つなのでTaskの型指定
  getTaskById(userId: number, taskId: number): Promise<Task> {
    return this.prisma.task.findFirst({
      where: {
        userId,
        id: taskId,
      },
    });
  }

  // 新規でtaskを作成（dtoにはクライアントから送られてくるtitleとディスクリプションが入っている）
  async createTask(userId: number, dto: CreateTaskDto): Promise<Task> {
    const task = await this.prisma.task.create({
      // 以下のものを渡す
      data: {
        userId,
        ...dto,
      },
    });
    // 入っているものを返す
    return task;
  }
  // タスクをアップデートする
  //  dtoにはクライアントから送られてくる変更後のtitleとディスクリプション
  async updateTaskById(
    userId: number,
    taskId: number,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    // 更新しようとしているオブジェクトがデータベースに存在しているのか調べる
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    // 存在しない場合、task内のuserIdとログインしてるuserIdが一致しない場合（ログインしているユーザー以外のは変えられないようにする）
    if (!task || task.userId !== userId)
      throw new ForbiddenException('No permission to update');
    // OKだった場合
    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...dto,
      },
    });
  }
  //   タスクを削除する
  async deleteTaskById(userId: number, taskId: number): Promise<void> {
    // 削除したいタスクが存在するのか確認
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    // 存在しない場合、ログインしているユーザーのものと一致しない場合
    if (!task || task.userId !== userId)
      throw new ForbiddenException('No permission to delete');

    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  }
}
