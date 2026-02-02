import { Link } from "react-router-dom";
import { Button, Input } from "@nursequest/ui-components";

export default function ForgotPasswordPage() {
  return (
    <div className="app-shell">
      <div className="auth-card">
        <h1 className="auth-card__title">Reset password</h1>
        <p className="notice">Email delivery is deferred. Use Mailpit locally.</p>
        <form className="form-stack">
          <Input label="Username or email" name="identifier" placeholder="Enter username" />
          <div className="form-actions">
            <Button type="submit">Send reset link</Button>
            <div className="helper-links">
              <Link to="/login">Back to login</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
