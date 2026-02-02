import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { Group } from "./entities/group.entity";
import { UserGroupMembership } from "../gameplay/entities/user-group-membership.entity";

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(UserGroupMembership)
    private readonly membershipRepo: Repository<UserGroupMembership>
  ) {}

  create(data: Partial<Group>) {
    const group = this.groupRepo.create({ ...data, id: randomUUID() });
    return this.groupRepo.save(group);
  }

  findAll() {
    return this.groupRepo.find({ 
      relations: ["assignments", "assignments.game", "memberships", "memberships.student"],
      order: { createdAt: "DESC" } 
    });
  }

  findAllByCollege(collegeId: string) {
    return this.groupRepo.find({ 
      where: { collegeId }, 
      relations: ["assignments", "assignments.game", "memberships", "memberships.student"],
      order: { createdAt: "DESC" } 
    });
  }

  async update(id: string, data: Partial<Group>) {
    await this.groupRepo.update({ id }, data as any);
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException("Group not found");
    return group;
  }

  async remove(id: string) {
    await this.groupRepo.delete({ id });
    return { success: true };
  }

  async addStudent(groupId: string, studentId: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException("Group not found");

    const existing = await this.membershipRepo.findOne({ where: { groupId, studentId } });
    if (existing) return existing;

    const membership = this.membershipRepo.create({
      id: randomUUID(),
      groupId,
      studentId
    });
    return this.membershipRepo.save(membership);
  }
}
