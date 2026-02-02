import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameSession } from "./game-session.entity";
import { GameQuestion } from "../../games/entities/game-question.entity";

@Entity({ name: "question_attempts" })
export class QuestionAttempt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "session_id" })
  sessionId!: string;

  @Column({ name: "question_id" })
  questionId!: string;

  @Column({ name: "selected_answer_ids", type: "jsonb", default: [] })
  selectedAnswerIds!: string[];

  @Column({ name: "is_correct", default: false })
  isCorrect!: boolean;

  @Column({ name: "points_earned", type: "int", default: 0 })
  pointsEarned!: number;

  @Column({ name: "hints_used", type: "int", default: 0 })
  hintsUsed!: number;

  @Column({ name: "time_spent_seconds", type: "int", default: 0 })
  timeSpentSeconds!: number;

  @Column({ name: "answered_at", type: "timestamp", default: () => "NOW()" })
  answeredAt!: Date;

  @ManyToOne(() => GameSession, (session) => session.questionAttempts)
  @JoinColumn({ name: "session_id" })
  session!: GameSession;

  @ManyToOne(() => GameQuestion)
  @JoinColumn({ name: "question_id" })
  question!: GameQuestion;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
