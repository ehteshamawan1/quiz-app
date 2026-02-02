import { Controller, Post, Param, Body, UseGuards, Request, Res, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";
import { ExportService } from "./export.service";
import { ExportRequestDto } from "./dto/export-request.dto";

@Controller("export")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Educator, RoleConstants.Admin)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  async exportData(
    @Body() exportRequest: ExportRequestDto,
    @Request() req: any,
    @Res() res: Response
  ) {
    const { type, entityId, format, startDate, endDate } = exportRequest;

    const result = await this.exportService.exportData(
      type,
      entityId,
      format,
      req.user.id,
      { startDate, endDate }
    );

    // Set appropriate headers
    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);

    if (typeof result.data === "string") {
      res.status(HttpStatus.OK).send(result.data);
    } else {
      res.status(HttpStatus.OK).send(result.data);
    }
  }

  @Post("game/:gameId/:format")
  async exportGame(
    @Param("gameId") gameId: string,
    @Param("format") format: "pdf" | "csv",
    @Request() req: any,
    @Res() res: Response
  ) {
    const result = await this.exportService.exportData(
      "game_results" as any,
      gameId,
      format as any,
      req.user.id
    );

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);

    if (typeof result.data === "string") {
      res.status(HttpStatus.OK).send(result.data);
    } else {
      res.status(HttpStatus.OK).send(result.data);
    }
  }

  @Post("student/:studentId/:format")
  async exportStudent(
    @Param("studentId") studentId: string,
    @Param("format") format: "pdf" | "csv",
    @Request() req: any,
    @Res() res: Response
  ) {
    const result = await this.exportService.exportData(
      "student_performance" as any,
      studentId,
      format as any,
      req.user.id
    );

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);

    if (typeof result.data === "string") {
      res.status(HttpStatus.OK).send(result.data);
    } else {
      res.status(HttpStatus.OK).send(result.data);
    }
  }

  @Post("assignment/:assignmentId/:format")
  async exportAssignment(
    @Param("assignmentId") assignmentId: string,
    @Param("format") format: "pdf" | "csv",
    @Request() req: any,
    @Res() res: Response
  ) {
    const result = await this.exportService.exportData(
      "assignment_results" as any,
      assignmentId,
      format as any,
      req.user.id
    );

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);

    if (typeof result.data === "string") {
      res.status(HttpStatus.OK).send(result.data);
    } else {
      res.status(HttpStatus.OK).send(result.data);
    }
  }
}
