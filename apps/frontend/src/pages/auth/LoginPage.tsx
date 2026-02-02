import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input } from "@nursequest/ui-components";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      const role = JSON.parse(localStorage.getItem("user") || "{}").role;
      if (role === "admin") navigate("/admin");
      else if (role === "educator") navigate("/educator");
      else navigate("/student");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="auth-card">
        <h1 className="auth-card__title">Welcome back</h1>
        <p>Sign in to manage your NurseQuest workspace.</p>
        <form className="form-stack" onSubmit={handleSubmit}>
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          <Input
            label="Username"
            name="username"
            placeholder="Enter username"
            value={username}
            onChange={(e: any) => setUsername(e.target.value)}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
          />
          <div className="form-actions">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="helper-links">
              <Link to="/forgot-password">Forgot password?</Link>
              <Link to="/register">Create account</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
