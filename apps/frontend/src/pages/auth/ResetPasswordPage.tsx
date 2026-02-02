import { Link } from "react-router-dom";
import { Button, Input } from "@nursequest/ui-components";

export default function ResetPasswordPage() {
  return (
    <div className="app-shell">
      <div className="auth-card">
        <h1 className="auth-card__title">Set a new password</h1>
        <form className="form-stack">
          <Input label="Reset token" name="token" placeholder="Paste token" />
          <Input label="New password" name="password" type="password" placeholder="New password" />
          <Input label="Confirm password" name="confirmPassword" type="password" placeholder="Re-enter password" />
          <div className="form-actions">
            <Button type="submit">Update password</Button>
            <div className="helper-links">
              <Link to="/login">Back to login</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
