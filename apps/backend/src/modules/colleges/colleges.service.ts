import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { College } from "./entities/college.entity";

@Injectable()
export class CollegesService {
  constructor(
    @InjectRepository(College)
    private readonly collegesRepo: Repository<College>
  ) {}

  create(data: Partial<College>) {
    const college = this.collegesRepo.create(data);
    return this.collegesRepo.save(college);
  }

  findAll() {
    return this.collegesRepo.find({ order: { createdAt: "DESC" } });
  }

  async update(id: string, data: Partial<College>) {
    await this.collegesRepo.update({ id }, data);
    const college = await this.collegesRepo.findOne({ where: { id } });
    if (!college) throw new NotFoundException("College not found");
    return college;
  }

  async remove(id: string) {
    await this.collegesRepo.delete({ id });
    return { success: true };
  }
}
