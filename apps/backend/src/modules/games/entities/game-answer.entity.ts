import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameQuestion } from "./game-question.entity";

@Entity({ name: "game_answers" })
export class GameAnswer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "question_id" })
  questionId!: string;

  @Column({ type: "text" })
  text!: string;

  @Column({ name: "is_correct", default: false })
  isCorrect!: boolean;

  @ManyToOne(() => GameQuestion, (question) => question.answers)
  @JoinColumn({ name: "question_id" })
  question!: GameQuestion;
}
