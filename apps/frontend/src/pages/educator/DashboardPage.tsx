import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card } from "@nursequest/ui-components";
import { apiGet } from "../../utils/api";

export default function EducatorDashboardPage() {
  const [stats, setStats] = useState({ games: 0, groups: 0, assignments: 0 });

  useEffect(() => {
    apiGet<{ games: number; groups: number; assignments: number }>("/educator/overview")
      .then(setStats)
      .catch(() => null);
  }, []);

  return (
    <DashboardLayout role="educator" title="Educator Overview">
      <div className="stats-grid">
        <div className="stat-card">
          <strong>Active Games</strong>
          <div>{stats.games}</div>
        </div>
        <div className="stat-card">
          <strong>Groups</strong>
          <div>{stats.groups}</div>
        </div>
        <div className="stat-card">
          <strong>Assignments</strong>
          <div>{stats.assignments}</div>
        </div>
      </div>
      <Card title="Next Steps">
        <p>Create a new MCQ game or review student performance.</p>
      </Card>
      <Card title="Recent Activity">
        <p>Student attempts and game completions will appear here.</p>
      </Card>
      <Card title="Performance Summary">
        <p>Average scores and completion rates will appear here.</p>
      </Card>
    </DashboardLayout>
  );
}
