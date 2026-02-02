import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card } from "@nursequest/ui-components";
import { apiGet } from "../../utils/api";
import { appConfig } from "../../config/app.config";

type ReportType = "game_results" | "student_performance" | "assignment_results";
type ExportFormat = "pdf" | "csv";

interface Game {
  id: string;
  title: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface Assignment {
  id: string;
  gameId: string;
  game: { title: string };
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("game_results");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [games, setGames] = useState<Game[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch data based on report type
  useEffect(() => {
    const fetchData = async () => {
      try {
        switch (reportType) {
          case "game_results":
            const gamesData = await apiGet<Game[]>("/games");
            setGames(gamesData);
            if (gamesData.length > 0) setSelectedEntity(gamesData[0].id);
            break;
          case "student_performance":
            const studentsData = await apiGet<Student[]>("/users/students");
            setStudents(studentsData);
            if (studentsData.length > 0) setSelectedEntity(studentsData[0].id);
            break;
          case "assignment_results":
            const assignmentsData = await apiGet<Assignment[]>("/games/assignments");
            setAssignments(assignmentsData);
            if (assignmentsData.length > 0) setSelectedEntity(assignmentsData[0].id);
            break;
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data");
      }
    };

    fetchData();
  }, [reportType]);

  const handleGenerateReport = async () => {
    if (!selectedEntity) {
      setError("Please select an entity to generate report");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Build the export URL
      let url = `${appConfig.apiUrl}/export/${reportType.replace("_", "-")}/${selectedEntity}/${format}`;

      // Fetch the report
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          startDate: startDate || undefined,
          endDate: endDate || undefined
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      // Get the filename from Content-Disposition header or create one
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `report-${Date.now()}.${format}`;
      if (contentDisposition) {
        const matches = /filename="(.+)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setError("");
    } catch (err) {
      console.error("Failed to generate report:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getEntityOptions = () => {
    switch (reportType) {
      case "game_results":
        return games.map((game) => (
          <option key={game.id} value={game.id}>
            {game.title}
          </option>
        ));
      case "student_performance":
        return students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.firstName} {student.lastName}
          </option>
        ));
      case "assignment_results":
        return assignments.map((assignment) => (
          <option key={assignment.id} value={assignment.id}>
            {assignment.game?.title || "Assignment"}
          </option>
        ));
      default:
        return null;
    }
  };

  const getEntityLabel = () => {
    switch (reportType) {
      case "game_results":
        return "Select Game";
      case "student_performance":
        return "Select Student";
      case "assignment_results":
        return "Select Assignment";
      default:
        return "Select Entity";
    }
  };

  return (
    <DashboardLayout role="educator" title="Reports">
      <Card title="Generate Report">
        <div className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as ReportType);
                setSelectedEntity("");
                setError("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="game_results">Game Results</option>
              <option value="student_performance">Student Performance</option>
              <option value="assignment_results">Assignment Results</option>
            </select>
          </div>

          {/* Entity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getEntityLabel()}
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {getEntityOptions()}
            </select>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === "pdf"}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  className="mr-2"
                />
                PDF
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={format === "csv"}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  className="mr-2"
                />
                CSV
              </label>
            </div>
          </div>

          {/* Date Range (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <div>
            <button
              onClick={handleGenerateReport}
              disabled={loading || !selectedEntity}
              className={`w-full py-3 px-4 rounded-md font-semibold ${
                loading || !selectedEntity
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Generating Report..." : "Generate & Download Report"}
            </button>
          </div>
        </div>
      </Card>

      {/* Information Card */}
      <Card title="Report Information" className="mt-6">
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">Game Results Report</h4>
            <p>
              Exports comprehensive analytics for a specific game including completion rates,
              score distribution, average time, and top performers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Student Performance Report</h4>
            <p>
              Exports a student's performance across all games including average scores,
              pass rates, total time spent, and recent game history.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Assignment Results Report</h4>
            <p>
              Exports results for a specific assignment including submission status,
              student scores, and completion trends.
            </p>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> PDF reports provide a formatted document suitable for printing.
              CSV reports provide raw data that can be imported into spreadsheet applications for
              further analysis.
            </p>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
