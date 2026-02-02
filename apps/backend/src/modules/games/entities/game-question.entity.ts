import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game.entity";
import { GameAnswer } from "./game-answer.entity";
import { GameHint } from "./game-hint.entity";

@Entity({ name: "game_questions" })
export class GameQuestion {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "game_id" })
  gameId!: string;

  @Column({ type: "text" })
  prompt!: string;

  @Column({ type: "text", nullable: true })
  explanation?: string;

  @Column({ type: "int", default: 10 })
  points!: number;

  @Column({ name: "allow_multiple", default: false })
  allowMultiple!: boolean;

  @Column({ name: "drag_items", type: "jsonb", nullable: true })
  dragItems?: any[];

  @Column({ name: "drop_zones", type: "jsonb", nullable: true })
  dropZones?: any[];

  @Column({ name: "crossword_grid", type: "jsonb", nullable: true })
  crosswordGrid?: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  clues?: Record<string, any>;

  @Column({ name: "image_url", nullable: true })
  imageUrl?: string;

  @Column({ name: "card_front", type: "text", nullable: true })
  cardFront?: string;

  @Column({ name: "card_back", type: "text", nullable: true })
  cardBack?: string;

  @Column({ name: "background_image_url", nullable: true })
  backgroundImageUrl?: string;

  @ManyToOne(() => Game, (game) => game.questions)
  @JoinColumn({ name: "game_id" })
  game!: Game;

  @OneToMany(() => GameAnswer, (answer) => answer.question, { cascade: true })
  answers!: GameAnswer[];

  @OneToMany(() => GameHint, (hint) => hint.question, { cascade: true })
  hints!: GameHint[];
}
