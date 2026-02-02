import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, Input, Button } from "@nursequest/ui-components";
import { apiGet, apiPut } from "../../utils/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState({ sessionTimeout: 30, passwordMinLength: 8, baseScore: 10, hintPenalty: 2 });

  useEffect(() => {
    apiGet<Array<{ key: string; value: Record<string, unknown> }>>("/settings")
      .then((rows) => {
        const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
        setSettings({
          sessionTimeout: Number(map.sessionTimeout ?? 30),
          passwordMinLength: Number(map.passwordMinLength ?? 8),
          baseScore: Number(map.baseScore ?? 10),
          hintPenalty: Number(map.hintPenalty ?? 2)
        });
      })
      .catch(() => null);
  }, []);

  return (
    <DashboardLayout role="admin" title="System Settings">
      <Card title="Platform Policies">
        <div className="form-stack">
          <Input label="Session timeout (minutes)" type="number" min={5} value={settings.sessionTimeout} onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })} />
          <Input label="Password minimum length" type="number" min={6} value={settings.passwordMinLength} onChange={(e) => setSettings({ ...settings, passwordMinLength: Number(e.target.value) })} />
          <Input label="Base score per question" type="number" min={0} value={settings.baseScore} onChange={(e) => setSettings({ ...settings, baseScore: Number(e.target.value) })} />
          <Input label="Hint penalty" type="number" min={0} value={settings.hintPenalty} onChange={(e) => setSettings({ ...settings, hintPenalty: Number(e.target.value) })} />
          <Button
            type="button"
            onClick={() => {
              apiPut("/settings/sessionTimeout", { value: settings.sessionTimeout });
              apiPut("/settings/passwordMinLength", { value: settings.passwordMinLength });
              apiPut("/settings/baseScore", { value: settings.baseScore });
              apiPut("/settings/hintPenalty", { value: settings.hintPenalty });
            }}
          >
            Save settings
          </Button>
        </div>
      </Card>
      <Card title="Email">
        <p>Email is deferred until a provider is configured.</p>
      </Card>
    </DashboardLayout>
  );
}
