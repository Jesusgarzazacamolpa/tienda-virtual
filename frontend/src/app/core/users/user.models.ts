export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  enabled: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string | null;
  roles: string[];
}

export interface UpdateUserRequest {
  email: string;
  firstName: string;
  lastName: string | null;
  roles: string[];
}
