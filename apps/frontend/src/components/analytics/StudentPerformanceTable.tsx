import { useState } from "react";

interface Student {
  studentId: string;
  studentName: string;
  score: number;
}

interface StudentPerformanceTableProps {
  students: Student[];
  title?: string;
}

export default function StudentPerformanceTable({ students, title = "Student Performance" }: StudentPerformanceTableProps) {
  const [sortBy, setSortBy] = useState<"name" | "score">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.studentName.localeCompare(b.studentName)
        : b.studentName.localeCompare(a.studentName);
    } else {
      return sortOrder === "asc"
        ? a.score - b.score
        : b.score - a.score;
    }
  });

  const toggleSort = (field: "name" | "score") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort("name")}
              >
                Student Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort("score")}
              >
                Score {sortBy === "score" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStudents.map((student) => {
              const performanceClass = student.score >= 80
                ? "text-green-600"
                : student.score >= 60
                ? "text-yellow-600"
                : "text-red-600";

              const performanceLabel = student.score >= 80
                ? "Excellent"
                : student.score >= 60
                ? "Good"
                : "Needs Improvement";

              return (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.score.toFixed(2)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${performanceClass}`}>
                    {performanceLabel}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No student data available
          </div>
        )}
      </div>
    </div>
  );
}
