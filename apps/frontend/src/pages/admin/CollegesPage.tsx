import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button, Input, Card } from "@nursequest/ui-components";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../utils/api";

export default function CollegesPage() {
  const [name, setName] = useState("");
  const [colleges, setColleges] = useState<Array<{ id: string; name: string }>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = () => {
    apiGet<Array<{ id: string; name: string }>>("/colleges")
      .then(setColleges)
      .catch(() => null);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateOrUpdate = () => {
    if (!name.trim()) return;
    
    if (editingId) {
      apiPatch(`/colleges/${editingId}`, { name }).then(() => {
        setName("");
        setEditingId(null);
        load();
      });
    } else {
      apiPost("/colleges", { name }).then(() => {
        setName("");
        load();
      });
    }
  };

  const handleEdit = (college: { id: string; name: string }) => {
    setName(college.name);
    setEditingId(college.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this college?")) {
      apiDelete(`/colleges/${id}`).then(load);
    }
  };

  return (
    <DashboardLayout role="admin" title="Colleges">
      <Card title={editingId ? "Edit College" : "Add College"}>
        <div className="form-stack">
          <Input label="College name" value={name} onChange={(event) => setName(event.target.value)} />
          <div className="flex gap-2">
            <Button type="button" onClick={handleCreateOrUpdate}>
              {editingId ? "Update college" : "Create college"}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={() => {
                setEditingId(null);
                setName("");
              }}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
      <Card title="Existing Colleges">
        {colleges.length === 0 ? (
          <p>No colleges yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>College Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((college) => (
                <tr key={college.id}>
                  <td style={{ fontWeight: 500 }}>{college.name}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(college)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(college.id)}>Delete</Button>
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