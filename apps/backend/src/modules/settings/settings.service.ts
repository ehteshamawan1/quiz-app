import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SystemSetting } from "./entities/system-setting.entity";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepo: Repository<SystemSetting>
  ) {}

  findAll() {
    return this.settingsRepo.find({ order: { key: "ASC" } });
  }

  async upsert(key: string, value: Record<string, unknown>) {
    const existing = await this.settingsRepo.findOne({ where: { key } });
    if (existing) {
      await this.settingsRepo.update({ key }, { value } as any);
      return this.settingsRepo.findOne({ where: { key } });
    }
    const setting = this.settingsRepo.create({ key, value });
    return this.settingsRepo.save(setting);
  }

  async remove(key: string) {
    const existing = await this.settingsRepo.findOne({ where: { key } });
    if (!existing) throw new NotFoundException("Setting not found");
    await this.settingsRepo.delete({ key });
    return { success: true };
  }
}
