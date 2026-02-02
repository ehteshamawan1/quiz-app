import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card } from "@nursequest/ui-components";
import { apiGet } from "../../utils/api";

type ScoreHistoryItem = {
  sessionId: string;
  gameId: string;
  gameTitle: string;
  score: number;
  totalScore: number;
  attemptNumber: number;
  isBestAttempt: boolean;
  passed: boolean;
  completedAt: string;
  timeSpentSeconds: number;
};

type ProfileData = {
  studentId: string;
  stats: {
    assignedCount: number;
    completedCount: number;
    inProgressCount: number;
    averageScore: number;
    totalTimeSpent: number;
    passRate: number;
    totalAttempts: number;
  };
  scoreHistory: ScoreHistoryItem[];
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ProfileData>("/student/profile")
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <DashboardLayout role="student" title="My Profile">
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role="student" title="My Profile">
        <div>Failed to load profile</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="My Profile">
      <Card title="Overall Statistics">
        <div className="stats-grid">
          <div className="stat-card">
            <strong>Assigned Games</strong>
            <div>{profile.stats.assignedCount}</div>
          </div>
          <div className="stat-card">
            <strong>Completed</strong>
            <div>{profile.stats.completedCount}</div>
          </div>
          <div className="stat-card">
            <strong>In Progress</strong>
            <div>{profile.stats.inProgressCount}</div>
          </div>
          <div className="stat-card">
            <strong>Average Score</strong>
            <div>{Number(profile.stats.averageScore ?? 0).toFixed(1)}%</div>
          </div>
          <div className="stat-card">
            <strong>Pass Rate</strong>
            <div>{Number(profile.stats.passRate ?? 0).toFixed(1)}%</div>
          </div>
          <div className="stat-card">
            <strong>Total Attempts</strong>
            <div>{profile.stats.totalAttempts}</div>
          </div>
          <div className="stat-card">
            <strong>Total Time</strong>
            <div>{formatTime(profile.stats.totalTimeSpent)}</div>
          </div>
        </div>
      </Card>

      <Card title="Score History">
        {profile.scoreHistory.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">No completed games yet. Start a game to build your history!</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-900">Game</th>
                  <th className="px-6 py-3 font-semibold text-gray-900">Score</th>
                  <th className="px-6 py-3 font-semibold text-gray-900">Attempt</th>
                  <th className="px-6 py-3 font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-900 text-right pr-10">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {profile.scoreHistory.map((item) => (
                  <tr key={item.sessionId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.gameTitle}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(item.completedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      {item.isBestAttempt && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-2">
                          ★ Best Attempt
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-lg font-bold ${item.passed ? "text-emerald-600" : "text-rose-600"}`}>
                        {Number(item.score ?? 0).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">{formatTime(item.timeSpentSeconds)} spent</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      Attempt #{item.attemptNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${item.passed ? "badge--success" : "badge--danger"}`}>
                        {item.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-10">
                      <Link 
                        to={`/student/games/sessions/${item.sessionId}/results`}
                        className="inline-flex items-center px-3 py-1.5 border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white transition-all rounded-md font-semibold text-xs uppercase tracking-wider"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
