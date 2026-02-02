import { IsEnum, IsUUID, IsOptional, IsDateString } from "class-validator";

export enum ExportFormat {
  PDF = "pdf",
  CSV = "csv"
}

export enum ReportType {
  GAME_RESULTS = "game_results",
  STUDENT_PERFORMANCE = "student_performance",
  CLASS_ROSTER = "class_roster",
  ASSIGNMENT_RESULTS = "assignment_results"
}

export class ExportReportDto {
  @IsEnum(ReportType)
  type!: ReportType;

  @IsUUID()
  entityId!: string;

  @IsEnum(ExportFormat)
  format!: ExportFormat;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
