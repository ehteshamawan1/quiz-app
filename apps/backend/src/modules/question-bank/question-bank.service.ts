import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QuestionBankItem } from "./entities/question-bank.entity";

@Injectable()
export class QuestionBankService {
  constructor(
    @InjectRepository(QuestionBankItem)
    private readonly questionRepo: Repository<QuestionBankItem>
  ) {}

  create(data: Partial<QuestionBankItem>) {
    const item = this.questionRepo.create(data);
    return this.questionRepo.save(item);
  }

  findAll() {
    return this.questionRepo.find({ order: { createdAt: "DESC" } });
  }

  findByOwner(ownerId: string) {
    return this.questionRepo.find({ where: { ownerId }, order: { createdAt: "DESC" } });
  }

  async update(id: string, data: Partial<QuestionBankItem>) {
    await this.questionRepo.update({ id }, data);
    const item = await this.questionRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException("Question not found");
    return item;
  }

  async remove(id: string) {
    await this.questionRepo.delete({ id });
    return { success: true };
  }
}
