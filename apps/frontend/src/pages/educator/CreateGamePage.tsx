import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button, Input, Card } from "@nursequest/ui-components";
import { apiGet, apiPost, apiUploadImage } from "../../utils/api";
import { TemplateTypes } from "@nursequest/shared";
import ImageUpload from "../../components/shared/ImageUpload";

// Template Editors
import FlashcardEditor from "../../components/template-editors/FlashcardEditor";
import HintDiscoveryEditor from "../../components/template-editors/HintDiscoveryEditor";
import TimedQuizEditor from "../../components/template-editors/TimedQuizEditor";
import DragDropEditor from "../../components/template-editors/DragDropEditor";
import WordCrossEditor from "../../components/template-editors/WordCrossEditor";
import MCQEditor from "../../components/template-editors/MCQEditor";

export default function CreateGamePage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; type: string; description: string }>>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    templateId: "",
    timeLimitMinutes: 0,
    passingScore: 70,
    randomizeQuestions: true,
    randomizeAnswers: true,
    reviewAfterSubmission: true
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [templateConfig, setTemplateConfig] = useState<any>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Array<{ id: string; name: string; type: string; description: string }>>("/templates")
      .then((data) => {
        setTemplates(data);
        if (data.length > 0) {
          handleSelectTemplate(data[0]);
        }
      })
      .catch(() => null);
  }, []);

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setForm({ ...form, templateId: template.id });
    setQuestions([]);
    setTemplateConfig({});
  };

  const renderEditor = () => {
    if (!selectedTemplate) return null;

    switch (selectedTemplate.type) {
      case TemplateTypes.FLASHCARDS:
        return (
          <FlashcardEditor
            cards={questions}
            onChange={setQuestions}
            config={templateConfig}
            onConfigChange={setTemplateConfig}
          />
        );

      case TemplateTypes.HINT_DISCOVERY:
        return (
          <HintDiscoveryEditor
            questions={questions}
            onChange={setQuestions}
            config={templateConfig}
            onConfigChange={setTemplateConfig}
          />
        );

      case TemplateTypes.TIMED_QUIZ:
        return (
          <TimedQuizEditor
            questions={questions}
            onChange={setQuestions}
            config={templateConfig}
            onConfigChange={setTemplateConfig}
          />
        );

      case TemplateTypes.DRAG_DROP:
        return (
          <DragDropEditor
            questions={questions}
            onChange={setQuestions}
            config={templateConfig}
            onConfigChange={setTemplateConfig}
          />
        );

      case TemplateTypes.WORD_CROSS:
        return (
          <WordCrossEditor
            questions={questions}
            onChange={setQuestions}
            config={templateConfig}
            onConfigChange={setTemplateConfig}
          />
        );

      case TemplateTypes.MCQ:
        return (
          <MCQEditor
            questions={questions}
            onChange={setQuestions}
          />
        );

      default:
        return (
          <div className="text-center py-8 text-gray-600">
            This template type is not yet supported in the editor.
          </div>
        );
    }
  };

  const validateAndSave = async () => {
    setError("");

    // Basic validation
    if (!form.title || !form.templateId) {
      setError("Title and template are required.");
      return;
    }

    if (questions.length === 0) {
      setError("Add at least one question/item before saving.");
      return;
    }

    // Template-specific validation
    switch (selectedTemplate.type) {
      case TemplateTypes.FLASHCARDS:
        for (const [index, card] of (questions as any[]).entries()) {
          if (!card.front || !card.back) {
            setError(`Card ${index + 1} needs both front and back content.`);
            return;
          }
        }
        break;

      case TemplateTypes.HINT_DISCOVERY:
      case TemplateTypes.TIMED_QUIZ:
        for (const [index, question] of (questions as any[]).entries()) {
          if (!question.prompt) {
            setError(`Question ${index + 1} needs a prompt.`);
            return;
          }
          if (!question.answers || question.answers.length < 2) {
            setError(`Question ${index + 1} needs at least two answers.`);
            return;
          }
          if (!question.answers.some((a: any) => a.isCorrect)) {
            setError(`Question ${index + 1} needs a correct answer.`);
            return;
          }
        }
        break;

      case TemplateTypes.DRAG_DROP:
        for (const [index, question] of (questions as any[]).entries()) {
          if (!question.prompt) {
            setError(`Question ${index + 1} needs a prompt.`);
            return;
          }
          if (question.dragItems.length === 0) {
            setError(`Question ${index + 1} needs draggable items.`);
            return;
          }
          if (question.dropZones.length === 0) {
            setError(`Question ${index + 1} needs drop zones.`);
            return;
          }
        }
        break;

      case TemplateTypes.WORD_CROSS:
        for (const [index, question] of (questions as any[]).entries()) {
          if (!question.prompt) {
            setError(`Crossword ${index + 1} needs instructions.`);
            return;
          }
          if (question.words.length < 3) {
            setError(`Crossword ${index + 1} needs at least 3 words.`);
            return;
          }
        }
        break;
    }

    // Save game
    setSaving(true);
    try {
      // Upload background image if provided
      let backgroundImageUrl: string | undefined = undefined;
      if (backgroundImage) {
        const uploadResult = await apiUploadImage(backgroundImage);
        backgroundImageUrl = uploadResult.url;
      }

      await apiPost("/games", {
        templateId: form.templateId,
        title: form.title,
        description: form.description,
        templateType: selectedTemplate.type,
        backgroundImageUrl,
        settings: {
          ...templateConfig,
          timeLimitMinutes: form.timeLimitMinutes,
          randomizeQuestions: form.randomizeQuestions,
          randomizeAnswers: form.randomizeAnswers,
          passingScore: form.passingScore,
          reviewAfterSubmission: form.reviewAfterSubmission
        },
        questions
      });

      // Navigate to games list
      navigate("/educator/games");
    } catch (err: any) {
      setError(err.message || "Failed to save game");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="educator" title="Create Game">
      {/* Game Details */}
      <Card title="Game Details">
        <div className="space-y-4">
          <Input
            label="Game Title"
            placeholder="Enter a descriptive title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Description"
            placeholder="Short description of this game"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <ImageUpload
            label="Background Image (Optional)"
            value={backgroundImagePreview || undefined}
            onChange={(file, preview) => {
              setBackgroundImage(file);
              setBackgroundImagePreview(preview);
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Time Limit (minutes, 0 = unlimited)"
              type="number"
              min={0}
              value={form.timeLimitMinutes}
              onChange={(e) => setForm({ ...form, timeLimitMinutes: Number(e.target.value) })}
            />
            <Input
              label="Passing Score (%)"
              type="number"
              min={0}
              max={100}
              value={form.passingScore}
              onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.randomizeQuestions}
                onChange={(e) => setForm({ ...form, randomizeQuestions: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Randomize question order</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.randomizeAnswers}
                onChange={(e) => setForm({ ...form, randomizeAnswers: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Randomize answer order</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.reviewAfterSubmission}
                onChange={(e) => setForm({ ...form, reviewAfterSubmission: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Allow review after submission</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Template Selection */}
      <Card title="Select Template">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedTemplate?.id === template.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-gray-800">{template.name}</div>
              <div className="text-sm text-gray-600 mt-1">{template.description}</div>
              {selectedTemplate?.id === template.id && (
                <div className="mt-2 text-xs font-semibold text-blue-600">✓ Selected</div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Template Editor */}
      {selectedTemplate && (
        <Card title={`Create ${selectedTemplate.name}`}>
          {renderEditor()}
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate("/educator/games")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={validateAndSave}
          disabled={saving || questions.length === 0}
        >
          {saving ? "Saving..." : "Save Game"}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
    </DashboardLayout>
  );
}
