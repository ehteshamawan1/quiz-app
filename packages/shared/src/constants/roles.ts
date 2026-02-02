export const Roles = {
  Admin: "admin",
  Educator: "educator",
  Student: "student"
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
