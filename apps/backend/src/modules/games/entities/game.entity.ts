import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { GameQuestion } from "./game-question.entity";
import { GameAssignment } from "./game-assignment.entity";
import { Template } from "../../templates/entities/template.entity";

@Entity({ name: "games" })
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "template_id" })
  templateId!: string;

  @ManyToOne(() => Template)
  @JoinColumn({ name: "template_id" })
  template!: Template;

  @Column({ name: "owner_id" })
  ownerId!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "jsonb", default: {} })
  settings!: Record<string, unknown>;

  @Column({ name: "is_published", default: true })
  isPublished!: boolean;

  @Column({ name: "background_image_url", nullable: true })
  backgroundImageUrl?: string;

  @OneToMany(() => GameQuestion, (question) => question.game, { cascade: true })
  questions!: GameQuestion[];

  @OneToMany(() => GameAssignment, (assignment) => assignment.game)
  assignments!: GameAssignment[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
