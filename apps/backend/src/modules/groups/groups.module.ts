import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Group } from "./entities/group.entity";
import { UserGroupMembership } from "../gameplay/entities/user-group-membership.entity";
import { UsersModule } from "../users/users.module";
import { GroupsController } from "./groups.controller";
import { GroupsService } from "./groups.service";

@Module({
  imports: [TypeOrmModule.forFeature([Group, UserGroupMembership]), UsersModule],
  controllers: [GroupsController],
  providers: [GroupsService]
})
export class GroupsModule {}
