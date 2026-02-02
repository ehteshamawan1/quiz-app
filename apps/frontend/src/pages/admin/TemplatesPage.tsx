import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button, Input, Card, Modal, Select } from "@nursequest/ui-components";
import { apiGet, apiPatch, apiPost, apiDelete } from "../../utils/api";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; type: string; isPublished: boolean; isFeatured: boolean; category?: string; difficulty?: string; description?: string }>>([]);
  const [form, setForm] = useState({ name: "", type: "mcq", category: "Assessment", difficulty: "Beginner", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ id: string; name: string; type: string; description?: string } | null>(null);

  const load = () => {
    apiGet<Array<{ id: string; name: string; type: string; isPublished: boolean; isFeatured: boolean; category?: string; difficulty?: string; description?: string }>>("/templates")
      .then(setTemplates)
      .catch(() => null);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateOrUpdate = () => {
    if (!form.name.trim()) return;
    
    if (editingId) {
      apiPatch(`/templates/${editingId}`, form).then(() => {
        setForm({ name: "", type: "mcq", category: "Assessment", difficulty: "Beginner", description: "" });
        setEditingId(null);
        load();
      });
    } else {
      apiPost("/templates", form).then(() => {
        setForm({ name: "", type: "mcq", category: "Assessment", difficulty: "Beginner", description: "" });
        load();
      });
    }
  };

  const handleEdit = (template: any) => {
    setForm({
      name: template.name,
      type: template.type,
      category: template.category || "Assessment",
      difficulty: template.difficulty || "Beginner",
      description: template.description || ""
    });
    setEditingId(template.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      apiDelete(`/templates/${id}`).then(load);
    }
  };

  const typeOptions = [
    { value: "mcq", label: "Multiple Choice" },
    { value: "hint_discovery", label: "Hint Discovery" },
    { value: "drag_drop", label: "Drag & Drop" },
    { value: "word_cross", label: "Word Cross" },
    { value: "flashcards", label: "Flashcards" },
    { value: "timed_quiz", label: "Timed Quiz" }
  ];

  const categoryOptions = [
    { value: "Assessment", label: "Assessment" },
    { value: "Practice", label: "Practice" },
    { value: "Exam", label: "Exam" },
    { value: "Review", label: "Review" }
  ];

  const difficultyOptions = [
    { value: "Beginner", label: "Beginner" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Advanced", label: "Advanced" }
  ];

  return (
    <DashboardLayout role="admin" title="Templates">
      <Card title={editingId ? "Edit Template" : "Create Template"}>
        <div className="form-stack">
          <Input label="Template name" placeholder="Multiple Choice" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select 
            label="Type" 
            value={form.type} 
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={typeOptions}
          />
          <Select 
            label="Category" 
            value={form.category} 
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={categoryOptions}
          />
          <Select 
            label="Difficulty" 
            value={form.difficulty} 
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            options={difficultyOptions}
          />
          <div className="flex gap-2">
            <Button type="button" onClick={handleCreateOrUpdate}>
              {editingId ? "Update template" : "Save template"}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={() => {
                setEditingId(null);
                setForm({ name: "", type: "mcq", category: "Assessment", difficulty: "Beginner", description: "" });
              }}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
      <Card title="Template Library">
        {templates.length === 0 ? (
          <p>No templates yet.</p>
        ) : (
          <ul className="template-list">
            {templates.map((template) => (
              <li key={template.id} className="template-item">
                <div>
                  <strong>{template.name}</strong> ({template.type})
                  {template.category ? ` • ${template.category}` : ""} {template.difficulty ? ` • ${template.difficulty}` : ""}
                </div>
                <div className="template-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => apiGet<{ id: string; name: string; type: string; description?: string }>(`/templates/${template.id}/preview`).then(setPreview)}
                  >
                    Preview
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleEdit(template)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleDelete(template.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      
      {preview && (
        <Modal title={`Preview: ${preview.name}`} isOpen={!!preview} onClose={() => setPreview(null)}>
          <div className="p-4">
            <div className="mb-4">
              <span className="text-sm text-gray-500 uppercase tracking-wide">Template Type</span>
              <p className="font-semibold">{preview.type}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500 uppercase tracking-wide">Description</span>
              <p>{preview.description || "No description provided."}</p>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}