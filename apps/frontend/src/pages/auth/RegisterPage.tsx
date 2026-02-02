import { Link } from "react-router-dom";
import { Button, Input } from "@nursequest/ui-components";

export default function RegisterPage() {
  return (
    <div className="app-shell">
      <div className="auth-card">
        <h1 className="auth-card__title">Create account</h1>
        <p>Admin-created accounts can finish setup here.</p>
        <form className="form-stack">
          <Input label="Username" name="username" placeholder="Choose username" />
          <Input label="Email (optional)" name="email" type="email" placeholder="name@email.com" />
          <Input label="Password" name="password" type="password" placeholder="Create password" />
          <Input label="Confirm password" name="confirmPassword" type="password" placeholder="Re-enter password" />
          <div className="form-actions">
            <Button type="submit">Create account</Button>
            <div className="helper-links">
              <Link to="/login">Back to login</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
