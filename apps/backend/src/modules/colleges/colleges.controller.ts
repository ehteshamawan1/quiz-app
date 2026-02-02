import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CollegesService } from "./colleges.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";

@Controller("colleges")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Admin)
export class CollegesController {
  constructor(private readonly collegesService: CollegesService) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.collegesService.create({ name: body.name, isActive: true });
  }

  @Get()
  findAll() {
    return this.collegesService.findAll();
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: Partial<{ name: string; isActive: boolean }>) {
    return this.collegesService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.collegesService.remove(id);
  }
}
