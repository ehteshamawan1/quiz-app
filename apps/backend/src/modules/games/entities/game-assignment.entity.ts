import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game.entity";
import { Group } from "../../groups/entities/group.entity";

@Entity({ name: "game_assignments" })
export class GameAssignment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "game_id" })
  gameId!: string;

  @ManyToOne(() => Game, (game) => game.assignments)
  @JoinColumn({ name: "game_id" })
  game!: Game;

  @Column({ name: "group_id" })
  groupId!: string;

  @ManyToOne(() => Group, (group) => group.assignments)
  @JoinColumn({ name: "group_id" })
  group!: Group;

  @Column({ name: "starts_at", nullable: true })
  startsAt?: Date;

  @Column({ name: "due_at", nullable: true })
  dueAt?: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
