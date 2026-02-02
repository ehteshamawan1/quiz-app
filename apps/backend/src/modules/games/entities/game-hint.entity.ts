import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameQuestion } from "./game-question.entity";

@Entity({ name: "game_hints" })
export class GameHint {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "question_id" })
  questionId!: string;

  @Column({ type: "text" })
  text!: string;

  @Column({ type: "int", default: 2 })
  penalty!: number;

  @ManyToOne(() => GameQuestion, (question) => question.hints)
  @JoinColumn({ name: "question_id" })
  question!: GameQuestion;
}
