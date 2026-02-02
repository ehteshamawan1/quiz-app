import { IsString, IsUUID, IsInt, Min } from "class-validator";

export class CompleteSessionDto {
  @IsString()
  @IsUUID()
  sessionId!: string;

  @IsInt()
  @Min(0)
  totalTimeSpentSeconds!: number;
}
