import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Game } from "../../games/entities/game.entity";
import { GameAssignment } from "../../games/entities/game-assignment.entity";
import { QuestionAttempt } from "./question-attempt.entity";
import { HintUsage } from "./hint-usage.entity";

export enum GameSessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

@Entity({ name: "game_sessions" })
export class GameSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "student_id" })
  studentId!: string;

  @Column({ name: "game_id" })
  gameId!: string;

  @Column({ name: "assignment_id", nullable: true })
  assignmentId?: string;

  @Column({ type: "varchar", length: 50, default: GameSessionStatus.IN_PROGRESS })
  status!: GameSessionStatus;

  @Column({ name: "current_question_index", type: "int", default: 0 })
  currentQuestionIndex!: number;

  @Column({ name: "total_score", type: "int", default: 0 })
  totalScore!: number;

  @Column({ name: "percentage_score", type: "decimal", precision: 5, scale: 2, default: 0 })
  percentageScore!: number;

  @Column({ name: "attempt_number", type: "int", default: 1 })
  attemptNumber!: number;

  @Column({ name: "is_best_attempt", default: false })
  isBestAttempt!: boolean;

  @Column({ name: "time_spent_seconds", type: "int", default: 0 })
  timeSpentSeconds!: number;

  @Column({ name: "started_at", type: "timestamp", default: () => "NOW()" })
  startedAt!: Date;

  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completedAt?: Date;

  @ManyToOne(() => Game)
  @JoinColumn({ name: "game_id" })
  game!: Game;

  @ManyToOne(() => GameAssignment, { nullable: true })
  @JoinColumn({ name: "assignment_id" })
  assignment?: GameAssignment;

  @OneToMany(() => QuestionAttempt, (attempt) => attempt.session, { cascade: true })
  questionAttempts!: QuestionAttempt[];

  @OneToMany(() => HintUsage, (usage) => usage.session, { cascade: true })
  hintUsages!: HintUsage[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
