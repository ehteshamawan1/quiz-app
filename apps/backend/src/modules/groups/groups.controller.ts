import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { GroupsService } from "./groups.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";
import { UsersService } from "../users/users.service";

@Controller("groups")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Admin, RoleConstants.Educator)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService, private readonly usersService: UsersService) {}

  @Post()
  async create(@Request() req: { user: { userId: string; role: string } }, @Body() body: { collegeId?: string; name: string }) {
    let collegeId = body.collegeId;
    if (!collegeId && req.user.role === RoleConstants.Educator) {
      const user = await this.usersService.findById(req.user.userId);
      collegeId = user?.collegeId;
    }
    if (!collegeId) return [];
    return this.groupsService.create({
      collegeId,
      name: body.name,
      isActive: true
    });
  }

  @Get()
  async findAll(@Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role === RoleConstants.Admin) return this.groupsService.findAll();
    const user = await this.usersService.findById(req.user.userId);
    if (!user?.collegeId) return [];
    return this.groupsService.findAllByCollege(user.collegeId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: Partial<{ name: string; isActive: boolean }>) {
    return this.groupsService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.groupsService.remove(id);
  }

  @Post(":id/students")
  addStudent(@Param("id") id: string, @Body() body: { studentId: string }) {
    return this.groupsService.addStudent(id, body.studentId);
  }
}
