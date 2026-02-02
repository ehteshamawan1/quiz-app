import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card } from "@nursequest/ui-components";
import { apiGet } from "../../utils/api";
import PerformanceChart from "../../components/analytics/PerformanceChart";
import CompletionRateChart from "../../components/analytics/CompletionRateChart";
import StudentPerformanceTable from "../../components/analytics/StudentPerformanceTable";
import QuestionDifficultyTable from "../../components/analytics/QuestionDifficultyTable";
import FilterPanel, { FilterValues } from "../../components/analytics/FilterPanel";

interface EducatorOverview {
  activeGames: number;
  totalStudents: number;
  averageClassScore: number;
  totalSessions: number;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}

interface GameAnalytics {
  gameId: string;
  gameName: string;
  completionRate: number;
  averageScore: number;
  averageTime: number;
  totalAttempts: number;
  uniqueStudents: number;
  attemptDistribution: Array<{ range: string; count: number }>;
  passRate: number;
  topPerformers: Array<{ studentId: string; studentName: string; score: number }>;
}

interface QuestionDifficulty {
  questionId: string;
  prompt: string;
  errorRate: number;
  averageTime: number;
  totalAttempts: number;
  correctAttempts: number;
}

interface TrendData {
  gameId: string;
  gameName: string;
  dataPoints: Array<{ date: string; averageScore: number; sessionCount: number }>;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<EducatorOverview | null>(null);
  const [games, setGames] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [gameAnalytics, setGameAnalytics] = useState<GameAnalytics | null>(null);
  const [questionDifficulty, setQuestionDifficulty] = useState<QuestionDifficulty[]>([]);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});
  const [loading, setLoading] = useState(true);

  // Fetch educator overview
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await apiGet<EducatorOverview>("/analytics/overview");
        setOverview(data);
      } catch (error) {
        console.error("Failed to fetch overview:", error);
      }
    };
    fetchOverview();
  }, []);

  // Fetch games list
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await apiGet<Array<{ id: string; title: string }>>("/games");
        setGames(data);
        if (!selectedGame) {
          setSelectedGame("all");
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Fetch game analytics when game or filters change
  useEffect(() => {
    if (!selectedGame) return;

    const fetchGameAnalytics = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);

        const [analytics, difficulty, trends] = await Promise.all([
          apiGet<GameAnalytics>(`/analytics/games/${selectedGame}?${params.toString()}`),
          apiGet<QuestionDifficulty[]>(`/analytics/questions/${selectedGame}/difficulty`),
          apiGet<TrendData>(`/analytics/trends/${selectedGame}?${params.toString()}`)
        ]);

        setGameAnalytics(analytics);
        setQuestionDifficulty(difficulty);
        setTrendData(trends);
      } catch (error) {
        console.error("Failed to fetch game analytics:", error);
      }
    };

    fetchGameAnalytics();
  }, [selectedGame, filters]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setSelectedGame(newFilters.gameId || "all");
  };

  if (loading) {
    return (
      <DashboardLayout role="educator" title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="educator" title="Analytics">
      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{overview.activeGames}</div>
              <div className="text-sm text-gray-600 mt-1">Active Games</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{overview.totalStudents}</div>
              <div className="text-sm text-gray-600 mt-1">Total Students</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {overview.averageClassScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Average Score</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{overview.totalSessions}</div>
              <div className="text-sm text-gray-600 mt-1">Total Sessions</div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <FilterPanel
        onFilterChange={handleFilterChange}
        showGameFilter={true}
        games={games}
      />

      {/* Game-Specific Analytics */}
      {gameAnalytics && (
        <>
          {/* Summary Stats */}
          <Card title={`Analytics for ${gameAnalytics.gameName}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {gameAnalytics.totalAttempts}
                </div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {gameAnalytics.uniqueStudents}
                </div>
                <div className="text-sm text-gray-600">Unique Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {gameAnalytics.averageScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(gameAnalytics.averageTime / 60)} min
                </div>
                <div className="text-sm text-gray-600">Average Time</div>
              </div>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <PerformanceChart data={gameAnalytics.attemptDistribution} />
            {trendData && trendData.dataPoints.length > 0 && (
              <CompletionRateChart data={trendData.dataPoints} />
            )}
          </div>

          {/* Top Performers */}
          {gameAnalytics.topPerformers.length > 0 && (
            <div className="mt-6">
              <StudentPerformanceTable
                students={gameAnalytics.topPerformers}
                title="Top Performers"
              />
            </div>
          )}

          {/* Question Difficulty */}
          {questionDifficulty.length > 0 && (
            <div className="mt-6">
              <QuestionDifficultyTable questions={questionDifficulty} />
            </div>
          )}
        </>
      )}

      {/* No Game Selected */}
      {!selectedGame && games.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600">
              No games available. Create a game to start seeing analytics.
            </p>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {overview && overview.recentActivity.length > 0 && (
        <Card title="Recent Activity" className="mt-6">
          <div className="space-y-3">
            {overview.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-0">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
