import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Group } from "../../groups/entities/group.entity";
import { User } from "../../users/entities/user.entity";

@Entity({ name: "user_group_memberships" })
export class UserGroupMembership {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "student_id" })
  studentId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "student_id" })
  student!: User;

  @Column({ name: "group_id" })
  groupId!: string;

  @ManyToOne(() => Group)
  @JoinColumn({ name: "group_id" })
  group!: Group;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
