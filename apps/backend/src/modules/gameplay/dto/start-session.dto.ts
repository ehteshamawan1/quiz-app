import { IsString, IsUUID, IsOptional } from "class-validator";

export class StartSessionDto {
  @IsString()
  @IsUUID()
  gameId!: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  assignmentId?: string;
}
