import * as bcrypt from "bcrypt";
import { Role, Roles } from "@nursequest/shared";

export async function seedUsers() {
  const passwordHash = await bcrypt.hash("ChangeMe123", 10);
  return [
    {
      username: "admin",
      email: "admin@nursequest.local",
      role: Roles.Admin as Role,
      passwordHash
    }
  ];
}
