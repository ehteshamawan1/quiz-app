import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button, Input, Card, Select } from "@nursequest/ui-components";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../utils/api";

export default function UsersPage() {
  const [users, setUsers] = useState<Array<{ id: string; username: string; role: string; email?: string; collegeId?: string }>>([]);
  const [form, setForm] = useState({ username: "", email: "", role: "student", collegeId: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [csv, setCsv] = useState("");

  const load = () => {
    apiGet<Array<{ id: string; username: string; role: string; email?: string; collegeId?: string }>>("/users")
      .then(setUsers)
      .catch(() => null);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateOrUpdate = () => {
    if (!form.username.trim()) return;
    
    if (editingId) {
      apiPatch(`/users/${editingId}`, form).then(() => {
        setForm({ username: "", email: "", role: "student", collegeId: "" });
        setEditingId(null);
        load();
      });
    } else {
      apiPost("/users", form).then(() => {
        setForm({ username: "", email: "", role: "student", collegeId: "" });
        load();
      });
    }
  };

  const handleEdit = (user: any) => {
    setForm({
      username: user.username,
      email: user.email || "",
      role: user.role,
      collegeId: user.collegeId || ""
    });
    setEditingId(user.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      apiDelete(`/users/${id}`).then(load);
    }
  };

  return (
    <DashboardLayout role="admin" title="Users">
      <Card title={editingId ? "Edit User" : "Create User"}>
        <div className="form-stack">
          <Input label="Username" placeholder="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input label="Email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Select 
            label="Role" 
            value={form.role} 
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: "student", label: "Student" },
              { value: "educator", label: "Educator" },
              { value: "admin", label: "Admin" }
            ]}
          />
          <Input label="College ID (optional)" value={form.collegeId} onChange={(e) => setForm({ ...form, collegeId: e.target.value })} />
          <div className="flex gap-2">
            <Button type="button" onClick={handleCreateOrUpdate}>
              {editingId ? "Update user" : "Create user"}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={() => {
                setEditingId(null);
                setForm({ username: "", email: "", role: "student", collegeId: "" });
              }}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
      {!editingId && (
        <Card title="Bulk Import">
          <p>Paste CSV (username,email,role,password,college_id,is_active)</p>
          <textarea className="csv-input" value={csv} onChange={(e) => setCsv(e.target.value)} rows={6} />
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (!csv.trim()) return;
              apiPost("/users/bulk", { csv }).then(() => {
                setCsv("");
                load();
              });
            }}
          >
            Upload CSV
          </Button>
        </Card>
      )}
      <Card title="All Users">
        {users.length === 0 ? (
          <p>No users yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>
                    <span className="dashboard-role" style={{ fontSize: "0.75rem", padding: "0.1rem 0.5rem" }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </DashboardLayout>
  );
}