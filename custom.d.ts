import { User } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    // 標準のexpressの型Requestに対してuserフィールドを追加
    // データ型をカスタムのUser型に置き換えている
    user?: Omit<User, 'hashedPassword'>;
  }
}
