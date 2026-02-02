import { IsUUID, IsOptional, IsDateString } from "class-validator";

export class StudentAnalyticsDto {
  @IsUUID()
  studentId!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
