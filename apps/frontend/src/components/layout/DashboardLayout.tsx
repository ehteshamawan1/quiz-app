import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@nursequest/ui-components";

const adminLinks = [
  { label: "Dashboard", to: "/admin" },
  { label: "Colleges", to: "/admin/colleges" },
  { label: "Users", to: "/admin/users" },
  { label: "Templates", to: "/admin/templates" },
  { label: "Settings", to: "/admin/settings" }
];

const educatorLinks = [
  { label: "Dashboard", to: "/educator" },
  { label: "Games", to: "/educator/games" },
  { label: "Create Game", to: "/educator/games/create" },
  { label: "Question Bank", to: "/educator/question-bank" },
  { label: "Students", to: "/educator/students" },
  { label: "Analytics", to: "/educator/analytics" },
  { label: "Reports", to: "/educator/reports" }
];

const studentLinks = [
  { label: "Dashboard", to: "/student" },
  { label: "My Games", to: "/student/games" },
  { label: "Profile", to: "/student/profile" }
];

type DashboardLayoutProps = {
  children: ReactNode;
  role: "admin" | "educator" | "student";
  title: string;
};

export default function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = role === "admin" ? adminLinks : role === "educator" ? educatorLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div>
          <div className="dashboard-brand">NurseQuest</div>
          <nav className="dashboard-nav">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="dashboard-nav__link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ marginTop: "auto" }}>
          <Button variant="ghost" onClick={handleLogout} style={{ color: "white", width: "100%", justifyContent: "flex-start" }}>
            Logout
          </Button>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>{title}</h1>
          <span className="dashboard-role">{role}</span>
        </header>
        <section className="dashboard-content">{children}</section>
      </main>
    </div>
  );
}
