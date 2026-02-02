import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Role, Roles } from "@nursequest/shared";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  async createUser(params: {
    username: string;
    email?: string;
    passwordHash: string;
    role?: Role;
    collegeId?: string;
  }) {
    const user = this.usersRepo.create({
      username: params.username,
      email: params.email,
      passwordHash: params.passwordHash,
      collegeId: params.collegeId,
      role: params.role ?? Roles.Admin,
      isActive: true
    });
    return this.usersRepo.save(user);
  }

  findByUsername(username: string) {
    return this.usersRepo.findOne({ where: { username } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async setPasswordHash(userId: string, passwordHash: string) {
    await this.usersRepo.update({ id: userId }, { passwordHash });
  }

  listAll() {
    return this.usersRepo.find({ order: { createdAt: "DESC" } });
  }

  findStudents() {
    return this.usersRepo.find({ where: { role: Roles.Student }, order: { username: "ASC" } });
  }

  async updateUser(id: string, data: Partial<User>) {
    await this.usersRepo.update({ id }, data);
    return this.findById(id);
  }

  async removeUser(id: string) {
    await this.usersRepo.delete({ id });
    return { success: true };
  }

  async bulkCreate(rows: Array<Record<string, string>>) {
    const users: User[] = [];
    for (const row of rows) {
      if (!row.username) continue;
      const plainPassword = row.password || "ChangeMe123";
      const passwordHash = row.password_hash || (await bcrypt.hash(plainPassword, 10));
      users.push(
        this.usersRepo.create({
          username: row.username,
          email: row.email || undefined,
          passwordHash,
          collegeId: row.college_id || undefined,
          role: (row.role as Role) ?? Roles.Student,
          isActive: row.is_active ? row.is_active === "true" : true
        })
      );
    }
    return this.usersRepo.save(users);
  }
}
