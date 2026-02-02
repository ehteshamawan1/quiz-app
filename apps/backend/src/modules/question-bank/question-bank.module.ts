import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuestionBankItem } from "./entities/question-bank.entity";
import { QuestionBankService } from "./question-bank.service";
import { QuestionBankController } from "./question-bank.controller";

@Module({
  imports: [TypeOrmModule.forFeature([QuestionBankItem])],
  providers: [QuestionBankService],
  controllers: [QuestionBankController]
})
export class QuestionBankModule {}
