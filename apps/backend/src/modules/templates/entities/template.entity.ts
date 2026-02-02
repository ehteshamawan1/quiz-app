import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "templates" })
export class Template {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  type!: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  difficulty?: string;

  @Column({ name: "is_published", default: false })
  isPublished!: boolean;

  @Column({ name: "is_featured", default: false })
  isFeatured!: boolean;

  @Column({ type: "jsonb", default: {} })
  config!: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
