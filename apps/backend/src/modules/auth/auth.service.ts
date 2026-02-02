import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { UsersService } from "../users/users.service";
import { PasswordReset } from "./entities/password-reset.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>
  ) {}

  async register(username: string, password: string, email?: string) {
    const existing = await this.usersService.findByUsername(username);
    if (existing) {
      throw new BadRequestException("Username already exists");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser({ username, email, passwordHash });
    const token = this.signToken(user.id, user.username, user.role);
    return {
      ...token,
      user
    };
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid credentials");
    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const token = this.signToken(user.id, user.username, user.role);
    return {
      ...token,
      user
    };
  }

  async requestPasswordReset(identifier: string) {
    const user = await this.usersService.findByUsername(identifier);
    if (!user) {
      throw new BadRequestException("User not found");
    }
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    const reset = this.passwordResetRepo.create({
      userId: user.id,
      token,
      expiresAt,
      used: false
    });
    await this.passwordResetRepo.save(reset);
    return { token, expiresAt };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = await this.passwordResetRepo.findOne({ where: { token } });
    if (!reset || reset.used || reset.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException("Reset token is invalid or expired");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.setPasswordHash(reset.userId, passwordHash);
    await this.passwordResetRepo.update({ id: reset.id }, { used: true });
    return { success: true };
  }

  private signToken(userId: string, username: string, role: string) {
    const payload = { sub: userId, username, role };
    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
