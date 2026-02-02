import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameSession } from "./game-session.entity";
import { GameQuestion } from "../../games/entities/game-question.entity";
import { GameHint } from "../../games/entities/game-hint.entity";

@Entity({ name: "hint_usage" })
export class HintUsage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "session_id" })
  sessionId!: string;

  @Column({ name: "question_id" })
  questionId!: string;

  @Column({ name: "hint_id" })
  hintId!: string;

  @Column({ name: "revealed_at", type: "timestamp", default: () => "NOW()" })
  revealedAt!: Date;

  @ManyToOne(() => GameSession, (session) => session.hintUsages)
  @JoinColumn({ name: "session_id" })
  session!: GameSession;

  @ManyToOne(() => GameQuestion)
  @JoinColumn({ name: "question_id" })
  question!: GameQuestion;

  @ManyToOne(() => GameHint)
  @JoinColumn({ name: "hint_id" })
  hint!: GameHint;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
