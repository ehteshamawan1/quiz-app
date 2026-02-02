import { IsString, IsUUID } from "class-validator";

export class RevealHintDto {
  @IsString()
  @IsUUID()
  sessionId!: string;

  @IsString()
  @IsUUID()
  questionId!: string;

  @IsString()
  @IsUUID()
  hintId!: string;
}
