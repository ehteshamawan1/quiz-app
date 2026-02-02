import { Role } from "../constants/roles.js";

export type User = {
  id: string;
  username: string;
  email?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};
