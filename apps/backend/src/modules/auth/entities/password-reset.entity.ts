import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "password_resets" })
export class PasswordReset {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column({ unique: true })
  token!: string;

  @Column({ name: "expires_at" })
  expiresAt!: Date;

  @Column({ default: false })
  used!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
