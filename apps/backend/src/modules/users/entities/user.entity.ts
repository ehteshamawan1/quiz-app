import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role, Roles } from "@nursequest/shared";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: "password_hash" })
  passwordHash!: string;

  @Column({ name: "college_id", nullable: true })
  collegeId?: string;

  @Column({ type: "varchar" })
  role!: Role;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
