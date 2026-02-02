import { useState } from "react";

interface QuestionDifficulty {
  questionId: string;
  prompt: string;
  errorRate: number;
  averageTime: number;
  totalAttempts: number;
  correctAttempts: number;
}

interface QuestionDifficultyTableProps {
  questions: QuestionDifficulty[];
}

export default function QuestionDifficultyTable({ questions }: QuestionDifficultyTableProps) {
  const [sortBy, setSortBy] = useState<"errorRate" | "averageTime">("errorRate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedQuestions = [...questions].sort((a, b) => {
    const aValue = sortBy === "errorRate" ? a.errorRate : a.averageTime;
    const bValue = sortBy === "errorRate" ? b.errorRate : b.averageTime;
    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  const toggleSort = (field: "errorRate" | "averageTime") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Question Difficulty Analysis</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort("errorRate")}
              >
                Error Rate {sortBy === "errorRate" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort("averageTime")}
              >
                Avg Time {sortBy === "averageTime" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedQuestions.map((question) => {
              const difficultyClass = question.errorRate > 60
                ? "bg-red-100 text-red-800"
                : question.errorRate > 30
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800";

              const difficultyLabel = question.errorRate > 60
                ? "Hard"
                : question.errorRate > 30
                ? "Medium"
                : "Easy";

              return (
                <tr key={question.questionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                    {question.prompt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {question.errorRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(question.averageTime)}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {question.correctAttempts}/{question.totalAttempts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${difficultyClass}`}>
                      {difficultyLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No question data available
          </div>
        )}
      </div>
    </div>
  );
}
