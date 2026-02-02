import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "question_bank" })
export class QuestionBankItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "owner_id" })
  ownerId!: string;

  @Column({ type: "text" })
  prompt!: string;

  @Column({ nullable: true })
  topic?: string;

  @Column({ type: "jsonb", default: [] })
  tags!: string[];

  @Column({ type: "jsonb", default: [] })
  answers!: Array<{ text: string; isCorrect: boolean }>;

  @Column({ type: "jsonb", default: [] })
  hints!: Array<{ text: string; penalty?: number }>;

  @Column({ type: "text", nullable: true })
  explanation?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
