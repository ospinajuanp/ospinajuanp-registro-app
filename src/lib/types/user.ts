export interface User {
  username: string;
  email: string;
  password: string;
  isAuthorized: boolean | "true";
  createdAt: string;
}

export interface StoredUser extends User {}

export interface JwtPayload {
  email: string;
  role: "admin" | "user";
  isAuthorized: boolean;
}
