import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card } from "@nursequest/ui-components";
import { apiGet } from "../../utils/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ colleges: 0, users: 0, templates: 0, games: 0 });

  useEffect(() => {
    apiGet<{ colleges: number; users: number; templates: number; games: number }>("/admin/overview")
      .then(setStats)
      .catch(() => null);
  }, []);

  return (
    <DashboardLayout role="admin" title="Admin Overview">
      <div className="stats-grid">
        <div className="stat-card">
          <strong>Colleges</strong>
          <div>{stats.colleges}</div>
        </div>
        <div className="stat-card">
          <strong>Users</strong>
          <div>{stats.users}</div>
        </div>
        <div className="stat-card">
          <strong>Templates</strong>
          <div>{stats.templates}</div>
        </div>
        <div className="stat-card">
          <strong>Games</strong>
          <div>{stats.games}</div>
        </div>
      </div>
      <Card title="Quick Actions">
        <p>Create colleges, onboard educators, and publish templates.</p>
      </Card>
      <Card title="Recent Activity">
        <p>Latest user signups and template changes will appear here.</p>
      </Card>
      <Card title="System Health">
        <p>Service status and performance indicators will appear here.</p>
      </Card>
    </DashboardLayout>
  );
}
