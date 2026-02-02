import { IsString, IsUUID, IsArray, IsInt, Min } from "class-validator";

export class SubmitAnswerDto {
  @IsString()
  @IsUUID()
  sessionId!: string;

  @IsString()
  @IsUUID()
  questionId!: string;

  // Can be string[] for MCQ or object for DragDrop/WordCross
  selectedAnswerIds!: any;

  @IsInt()
  @Min(0)
  timeSpentSeconds!: number;
}
