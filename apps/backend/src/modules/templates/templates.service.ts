import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Template } from "./entities/template.entity";

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templatesRepo: Repository<Template>
  ) {}

  create(data: Partial<Template>) {
    const template = this.templatesRepo.create(data);
    return this.templatesRepo.save(template);
  }

  findAll() {
    return this.templatesRepo.find({ order: { createdAt: "DESC" } });
  }

  async findOne(id: string) {
    const template = await this.templatesRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException("Template not found");
    return template;
  }

  async update(id: string, data: Partial<Template>) {
    await this.templatesRepo.update({ id }, data as any);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.templatesRepo.delete({ id });
    return { success: true };
  }

  async clone(id: string, name?: string) {
    const template = await this.findOne(id);
    const copy = this.templatesRepo.create({
      name: name ?? `${template.name} (Copy)`,
      description: template.description,
      type: template.type,
      config: template.config,
      isPublished: false,
      isFeatured: false
    });
    return this.templatesRepo.save(copy);
  }
}
