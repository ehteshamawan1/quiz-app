import { Injectable } from "@nestjs/common";
import { AnalyticsService, GameAnalytics, StudentPerformance } from "../analytics/analytics.service";
import { ExportFormat, ExportType } from "./dto/export-request.dto";

@Injectable()
export class ExportService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async exportData(
    type: ExportType,
    entityId: string,
    format: ExportFormat,
    educatorId: string,
    dateRange?: { startDate?: string; endDate?: string }
  ): Promise<{ data: Buffer | string; filename: string; mimeType: string }> {
    let result: any;
    let filename: string;

    // Fetch data based on type
    switch (type) {
      case ExportType.GAME_RESULTS:
        result = await this.analyticsService.getGameAnalytics(entityId, educatorId, dateRange);
        filename = `game-results-${entityId}`;
        break;
      case ExportType.STUDENT_PERFORMANCE:
        result = await this.analyticsService.getStudentPerformance(entityId, educatorId, dateRange);
        filename = `student-performance-${entityId}`;
        break;
      case ExportType.ASSIGNMENT_RESULTS:
        result = await this.analyticsService.getAssignmentAnalytics(entityId, educatorId);
        filename = `assignment-results-${entityId}`;
        break;
      default:
        throw new Error("Unsupported export type");
    }

    // Generate export based on format
    if (format === ExportFormat.CSV) {
      const csvData = this.generateCSV(type, result);
      return {
        data: csvData,
        filename: `${filename}.csv`,
        mimeType: "text/csv"
      };
    } else {
      const pdfData = this.generatePDF(type, result);
      return {
        data: pdfData,
        filename: `${filename}.pdf`,
        mimeType: "application/pdf"
      };
    }
  }

  private generateCSV(type: ExportType, data: any): string {
    const lines: string[] = [];

    switch (type) {
      case ExportType.GAME_RESULTS:
        return this.generateGameResultsCSV(data);
      case ExportType.STUDENT_PERFORMANCE:
        return this.generateStudentPerformanceCSV(data);
      case ExportType.ASSIGNMENT_RESULTS:
        return this.generateAssignmentResultsCSV(data);
      default:
        return "";
    }
  }

  private generateGameResultsCSV(analytics: GameAnalytics): string {
    const lines: string[] = [];

    // Header
    lines.push("Game Analytics Report");
    lines.push(`Game Name,${this.escapeCSV(analytics.gameName)}`);
    lines.push(`Game ID,${analytics.gameId}`);
    lines.push("");

    // Summary metrics
    lines.push("Metric,Value");
    lines.push(`Total Attempts,${analytics.totalAttempts}`);
    lines.push(`Unique Students,${analytics.uniqueStudents}`);
    lines.push(`Average Score,${analytics.averageScore.toFixed(2)}%`);
    lines.push(`Average Time,${Math.round(analytics.averageTime)} seconds`);
    lines.push(`Pass Rate,${analytics.passRate.toFixed(2)}%`);
    lines.push(`Completion Rate,${analytics.completionRate.toFixed(2)}%`);
    lines.push("");

    // Score distribution
    lines.push("Score Distribution");
    lines.push("Score Range,Count");
    analytics.attemptDistribution.forEach(dist => {
      lines.push(`${dist.range},${dist.count}`);
    });
    lines.push("");

    // Top performers
    lines.push("Top Performers");
    lines.push("Student Name,Score");
    analytics.topPerformers.forEach(performer => {
      lines.push(`${this.escapeCSV(performer.studentName)},${performer.score.toFixed(2)}%`);
    });

    return lines.join("\n");
  }

  private generateStudentPerformanceCSV(performance: StudentPerformance): string {
    const lines: string[] = [];

    // Header
    lines.push("Student Performance Report");
    lines.push(`Student Name,${this.escapeCSV(performance.studentName)}`);
    lines.push(`Student ID,${performance.studentId}`);
    lines.push("");

    // Summary metrics
    lines.push("Metric,Value");
    lines.push(`Games Completed,${performance.gamesCompleted}`);
    lines.push(`Average Score,${performance.averageScore.toFixed(2)}%`);
    lines.push(`Pass Rate,${performance.passRate.toFixed(2)}%`);
    lines.push(`Total Time Spent,${Math.round(performance.totalTimeSpent / 60)} minutes`);
    lines.push("");

    // Recent games
    lines.push("Recent Games");
    lines.push("Game Name,Score,Completed At");
    performance.recentGames.forEach(game => {
      lines.push(`${this.escapeCSV(game.gameName)},${game.score.toFixed(2)}%,${game.completedAt.toISOString()}`);
    });

    return lines.join("\n");
  }

  private generateAssignmentResultsCSV(analytics: any): string {
    const lines: string[] = [];

    // Header
    lines.push("Assignment Results Report");
    lines.push(`Game Name,${this.escapeCSV(analytics.gameName)}`);
    lines.push(`Assignment ID,${analytics.assignmentId}`);
    lines.push(`Due Date,${analytics.dueDate.toISOString()}`);
    lines.push("");

    // Summary metrics
    lines.push("Metric,Value");
    lines.push(`Total Students,${analytics.totalStudents}`);
    lines.push(`Submitted,${analytics.submitted}`);
    lines.push(`Pending,${analytics.pending}`);
    lines.push(`Average Score,${analytics.averageScore.toFixed(2)}%`);
    lines.push("");

    // Student results
    lines.push("Student Results");
    lines.push("Student Name,Score,Status");
    analytics.studentResults.forEach((result: any) => {
      lines.push(`${this.escapeCSV(result.studentName)},${result.score.toFixed(2)}%,${result.status}`);
    });

    return lines.join("\n");
  }

  private generatePDF(type: ExportType, data: any): Buffer {
    // For now, return a simple text-based PDF placeholder
    // In production, use pdfkit or puppeteer for proper PDF generation
    const textContent = this.generateCSV(type, data);

    // Simple PDF header (this is a placeholder - use proper PDF library in production)
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Courier
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length ${textContent.length + 100}
>>
stream
BT
/F1 12 Tf
50 700 Td
(Report Generated) Tj
0 -20 Td
(${textContent.replace(/\n/g, ") Tj 0 -15 Td (")}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000315 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${400 + textContent.length}
%%EOF`;

    return Buffer.from(pdfContent, "utf-8");
  }

  private escapeCSV(value: string): string {
    if (!value) return "";
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
