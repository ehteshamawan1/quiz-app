import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card } from "@nursequest/ui-components";
import { apiGet } from "../../utils/api";

type DashboardData = {
  stats: {
    assignedCount: number;
    completedCount: number;
    inProgressCount: number;
    averageScore: number;
  };
  recentActivity: Array<{
    gameId: string;
    gameTitle: string;
    score: number;
    completedAt: string;
    passed: boolean;
  }>;
  upcomingDue: Array<{
    gameId: string;
    title: string;
    dueAt: string;
    status: string;
  }>;
};

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<DashboardData>("/student/dashboard")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="student" title="Student Dashboard">
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout role="student" title="Student Dashboard">
        <div>Failed to load dashboard data</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="Student Dashboard">
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <strong>Assigned Games</strong>
            <div>{data.stats.assignedCount}</div>
          </div>
          <div className="stat-card">
            <strong>Completed</strong>
            <div>{data.stats.completedCount}</div>
          </div>
          <div className="stat-card">
            <strong>In Progress</strong>
            <div>{data.stats.inProgressCount}</div>
          </div>
          <div className="stat-card">
            <strong>Average Score</strong>
            <div>{Number(data.stats.averageScore).toFixed(1)}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Recent Activity">
            {data.recentActivity.length === 0 ? (
              <p className="p-4 text-gray-500">No recent activity. Start a game to see your progress here.</p>
            ) : (
              <div className="activity-list">
                {data.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-item__main">
                      <div className="activity-item__title">{activity.gameTitle}</div>
                      <span className="activity-item__date">
                        {new Date(activity.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`activity-item__score ${activity.passed ? "passed" : "failed"}`}>
                      {Number(activity.score).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Upcoming Due Dates">
            {data.upcomingDue.length === 0 ? (
              <p className="p-4 text-gray-500">No upcoming deadlines.</p>
            ) : (
              <div className="activity-list">
                {data.upcomingDue.map((item, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-item__main">
                      <div className="activity-item__title">{item.title}</div>
                      <span className="badge badge--warning text-xs mt-1 w-max">{item.status.replace('_', ' ')}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-600">
                      Due: {new Date(item.dueAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="flex justify-end">
          <Link to="/student/games" className="btn btn--primary" style={{ maxWidth: '200px' }}>
            View All Games →
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
