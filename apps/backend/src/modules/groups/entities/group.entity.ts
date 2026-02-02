import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GameAssignment } from "../../games/entities/game-assignment.entity";
import { UserGroupMembership } from "../../gameplay/entities/user-group-membership.entity";

@Entity({ name: "groups" })
export class Group {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "college_id" })
  collegeId!: string;

  @Column()
  name!: string;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @OneToMany(() => GameAssignment, (assignment) => assignment.group)
  assignments!: GameAssignment[];

  @OneToMany(() => UserGroupMembership, (membership) => membership.group)
  memberships!: UserGroupMembership[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
