import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { TemplatesService } from "./templates.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";

@Controller("templates")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @Roles(RoleConstants.Admin)
  create(@Body() body: { name: string; description?: string; type: string; category?: string; difficulty?: string; config?: Record<string, unknown> }) {
    return this.templatesService.create({
      name: body.name,
      description: body.description,
      type: body.type,
      category: body.category,
      difficulty: body.difficulty,
      config: body.config ?? {},
      isPublished: false,
      isFeatured: false
    });
  }

  @Get()
  @Roles(RoleConstants.Admin, RoleConstants.Educator)
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(":id")
  @Roles(RoleConstants.Admin, RoleConstants.Educator)
  findOne(@Param("id") id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(":id")
  @Roles(RoleConstants.Admin)
  update(@Param("id") id: string, @Body() body: Partial<{ name: string; description: string; type: string; category: string; difficulty: string; config: Record<string, unknown>; isPublished: boolean; isFeatured: boolean }>) {
    return this.templatesService.update(id, body);
  }

  @Get(":id/preview")
  @Roles(RoleConstants.Admin, RoleConstants.Educator)
  preview(@Param("id") id: string) {
    return this.templatesService.findOne(id);
  }

  @Delete(":id")
  @Roles(RoleConstants.Admin)
  remove(@Param("id") id: string) {
    return this.templatesService.remove(id);
  }

  @Post(":id/clone")
  @Roles(RoleConstants.Admin)
  clone(@Param("id") id: string, @Body() body: { name?: string }) {
    return this.templatesService.clone(id, body.name);
  }
}
