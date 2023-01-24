import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TodoService } from './todo.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';

// todoのエンドポイントをJWTでプロテクションする
@UseGuards(AuthGuard('jwt'))
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  //  ログインしているユーザーの全てのタスクを返す
  //  userはauth/strategy/jwt.strategy.tsで返している（requestの中に含含まれている）
  @Get()
  getTasks(@Req() req: Request): Promise<Task[]> {
    return this.todoService.getTasks(req.user.id);
  }

  //  特定のタスクを取得
  //  @Paramデコレーター： pathの末尾に指定されたパラメータを取得して、taskIdとして取り扱う
  //  :id（変数化）　ex: todo/1の１を変数として読み取れる
  @Get(':id')
  getTaskById(
    @Req() req: Request,
    // ParseIntPipe：parseで取得した末尾の１をInt型に変換してからtaskIdに格納してくれる
    @Param('id', ParseIntPipe) taskId: number,
  ): Promise<Task> {
    return this.todoService.getTaskById(req.user.id, taskId);
  }

  //  createのエンドポイント
  //   dtoにはtitleとディスクリプションが入っている
  @Post()
  // dtoにはtitleとディスクリプションが送られてくる
  createTask(@Req() req: Request, @Body() dto: CreateTaskDto): Promise<Task> {
    // req（リクエスト）の中からログインしているユーザーのuserIdをdtoとともにメソッドに渡す
    return this.todoService.createTask(req.user.id, dto);
  }

  @Patch(':id')
  updateTaskById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.todoService.updateTaskById(req.user.id, taskId, dto);
  }

  // deleteのエンドポイント
  // deleteに成功した場合のstatusをNO_CONTENTに設定
  @HttpCode(HttpStatus.NO_CONTENT)
  // :idをパラメータとして受け取るので@paramのデコレーションと:id、todoService.deleteTaskByIdを呼び出す
  @Delete(':id')
  deleteTaskById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) taskId: number,
  ): Promise<void> {
    return this.todoService.deleteTaskById(req.user.id, taskId);
  }
}
