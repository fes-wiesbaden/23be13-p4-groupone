export interface LoginResponse {
  error?: string;
  message?: string;
  id?: string;
  username?: string;
  role?: string;

  user?: {
    id?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
}
