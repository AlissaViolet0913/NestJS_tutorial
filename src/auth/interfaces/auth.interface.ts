// auth.controllerやauth.serviceで使用するデータ型を作っておく

// レスポンスのメッセージ
export interface Msg {
  message: string;
}
// CSRF Token
export interface Csrf {
  csrfToken: string;
}

// JWT アクセス Token
export interface Jwt {
  accessToken: string;
}
