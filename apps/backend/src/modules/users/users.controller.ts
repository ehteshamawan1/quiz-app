import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";
import { UsersService } from "./users.service";
import * as bcrypt from "bcrypt";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Request() req: { user: { userId: string; username: string; role: string } }) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleConstants.Admin)
  @Get("admin-check")
  adminCheck() {
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleConstants.Admin)
  @Get()
  list() {
    return this.usersService.listAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleConstants.Admin, RoleConstants.Educator)
  @Get("students")
  listStudents() {
    return this.usersService.findStudents();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleConstants.Admin)
  @Post()
  async create(@Body() body: { username: string; email?: string; role?: string; password?: string; collegeId?: string }) {
    const passwordHash = await bcrypt.hash(body.password ?? "ChangeMe123", 10);
    return this.usersService.createUser({
      username: body.username,
      email: body.email,
      passwordHash,
      role: body.role as any,
      collegeId: body.collegeId
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleConstants.Admin)
  @Patch(":id")
  update(@Param("id") id: string, @Body() body: { email?: string; role?: string; isActive?: boolean; collegeId?: string }) {
    return this.usersService.updateUser(id, body as any);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleConstants.Admin)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.removeUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleConstants.Admin)
  @Post("bulk")
  async bulkImport(@Body() body: { csv: string }) {
    const rows = parseCsv(body.csv);
    return this.usersService.bulkCreate(rows);
  }
}

function parseCsv(csv: string) {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}
