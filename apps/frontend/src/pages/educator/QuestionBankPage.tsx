import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, Button, Input } from "@nursequest/ui-components";
import { apiGet, apiPost } from "../../utils/api";

export default function QuestionBankPage() {
  const [items, setItems] = useState<Array<{ id: string; prompt: string }>>([]);
  const [form, setForm] = useState({ prompt: "", topic: "", tags: "" });

  const load = () => {
    apiGet<Array<{ id: string; prompt: string }>>("/question-bank")
      .then(setItems)
      .catch(() => null);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout role="educator" title="Question Bank">
      <Card title="Add Question">
        <div className="form-stack">
          <Input label="Prompt" value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
          <Input label="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <Button
            type="button"
            onClick={() => {
              if (!form.prompt.trim()) return;
              apiPost("/question-bank", {
                prompt: form.prompt,
                topic: form.topic || undefined,
                tags: form.tags ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
                answers: [
                  { text: "Answer A", isCorrect: true },
                  { text: "Answer B", isCorrect: false }
                ],
                hints: [{ text: "Hint 1" }, { text: "Hint 2" }],
                explanation: "Explain why the correct answer is correct."
              }).then(() => {
                setForm({ prompt: "", topic: "", tags: "" });
                load();
              });
            }}
          >
            Add question
          </Button>
        </div>
      </Card>
      <Card title="Question Library">
        {items.length === 0 ? <p>No questions yet.</p> : <ul>{items.map((item) => <li key={item.id}>{item.prompt}</li>)}</ul>}
      </Card>
    </DashboardLayout>
  );
}
