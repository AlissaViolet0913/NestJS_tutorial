import { User as CustomUser } from '@prisma/client';

// 型属性が上手く拡張できない(Userの型エラー発生のため)
// declare module 'express-serve-static-core' {
//   interface Request {
//     // 標準のexpressの型Requestに対してuserフィールドを追加
//     // データ型をカスタムのUser型に置き換えている
//     user?: Omit<User, 'hashedPassword'>;
//   }
// }
declare global {
  namespace Express {
    export interface Request {
      user: CustomUser;
    }
  }
}
