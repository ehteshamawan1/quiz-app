import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { College } from "./entities/college.entity";
import { CollegesController } from "./colleges.controller";
import { CollegesService } from "./colleges.service";

@Module({
  imports: [TypeOrmModule.forFeature([College])],
  controllers: [CollegesController],
  providers: [CollegesService]
})
export class CollegesModule {}
