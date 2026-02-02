import { Body, Controller, Delete, Get, Param, Put, UseGuards } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";

@Controller("settings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Admin)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Put(":key")
  upsert(@Param("key") key: string, @Body() body: { value: Record<string, unknown> }) {
    return this.settingsService.upsert(key, body.value ?? {});
  }

  @Delete(":key")
  remove(@Param("key") key: string) {
    return this.settingsService.remove(key);
  }
}
