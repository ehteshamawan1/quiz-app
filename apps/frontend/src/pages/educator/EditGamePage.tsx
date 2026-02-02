import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button, Input, Card } from "@nursequest/ui-components";
import { apiGet, apiPatch, apiUploadImage } from "../../utils/api";
import { TemplateTypes } from "@nursequest/shared";
import ImageUpload from "../../components/shared/ImageUpload";
import { appConfig } from "../../config/app.config";

// Template Editors
import FlashcardEditor, { FlashcardData } from "../../components/template-editors/FlashcardEditor";
import HintDiscoveryEditor from "../../components/template-editors/HintDiscoveryEditor";
import TimedQuizEditor from "../../components/template-editors/TimedQuizEditor";
import DragDropEditor from "../../components/template-editors/DragDropEditor";
import WordCrossEditor from "../../components/template-editors/WordCrossEditor";
import MCQEditor from "../../components/template-editors/MCQEditor";

export default function EditGamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [existingBackgroundUrl, setExistingBackgroundUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [game, templates] = await Promise.all([
          apiGet<any>(`/games/${id}`),
          apiGet<any[]>("/templates")
        ]);

        const template = templates.find((t) => t.id === game.templateId);
        if (!template) {
          setError("Template for this game not found.");
          setLoading(false);
          return;
        }

        setSelectedTemplate(template);

        // Populate form
        setForm({
          title: game.title,
          description: game.description || "",
          templateId: game.templateId,
          timeLimitMinutes: game.settings?.timeLimitMinutes || 0,
          passingScore: game.settings?.passingScore || 70,
          randomizeQuestions: game.settings?.randomizeQuestions ?? true,
          randomizeAnswers: game.settings?.randomizeAnswers ?? true,
          reviewAfterSubmission: game.settings?.reviewAfterSubmission ?? true
        });

        // Load existing background image
        if (game.backgroundImageUrl) {
          setExistingBackgroundUrl(game.backgroundImageUrl);
          const fullUrl = game.backgroundImageUrl.startsWith("http") 
            ? game.backgroundImageUrl 
            : `${appConfig.apiUrl}${game.backgroundImageUrl}`;
          setBackgroundImagePreview(fullUrl);
        }

        // Populate config
        setTemplateConfig(game.settings || {});

        // Map questions based on template type
        const mappedQuestions = mapQuestionsToEditor(game.questions, template.type);
        setQuestions(mappedQuestions);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load game data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const mapQuestionsToEditor = (gameQuestions: any[], type: string) => {
    if (!gameQuestions) return [];

    switch (type) {
      case TemplateTypes.FLASHCARDS:
        return gameQuestions.map((q: any) => ({
          id: q.id,
          front: q.cardFront || q.prompt, // Fallback to prompt if cardFront is missing
          back: q.cardBack || q.explanation || "", 
          imageUrl: q.imageUrl
        }));
      case TemplateTypes.DRAG_DROP:
        return gameQuestions.map((q: any) => ({
          id: q.id,
          prompt: q.prompt,
          explanation: q.explanation,
          dragItems: q.dragItems || [],
          dropZones: q.dropZones || []
        }));
      case TemplateTypes.WORD_CROSS:
        return gameQuestions.map((q: any) => {
          const words = [];
          const gridWords = q.crosswordGrid?.words || [];
          const acrossClues = q.clues?.across || [];
          const downClues = q.clues?.down || [];

          // Helper to find grid info
          const findGridInfo = (answer: string, direction: string) => 
            gridWords.find((gw: any) => gw.answer === answer && gw.direction === direction);

          acrossClues.forEach((c: any) => {
            const gridInfo = findGridInfo(c.answer, 'across');
            words.push({
              id: `word-${Math.random()}`, // Re-generate ID if lost
              answer: c.answer,
              clue: c.clue,
              direction: 'across',
              number: c.number,
              startRow: gridInfo?.startRow || 0,
              startCol: gridInfo?.startCol || 0
            });
          });

          downClues.forEach((c: any) => {
            const gridInfo = findGridInfo(c.answer, 'down');
            words.push({
              id: `word-${Math.random()}`,
              answer: c.answer,
              clue: c.clue,
              direction: 'down',
              number: c.number,
              startRow: gridInfo?.startRow || 0,
              startCol: gridInfo?.startCol || 0
            });
          });

          // Sort by number for better UX
          // @ts-ignore
          words.sort((a, b) => a.number - b.number);

          return {
            id: q.id,
            prompt: q.prompt,
            words: words
          };
        });
      case TemplateTypes.MCQ:
        return gameQuestions.map((q: any) => ({
          id: q.id,
          prompt: q.prompt,
          explanation: q.explanation,
          answers: q.answers || []
        }));
      default:
        return gameQuestions;
    }
  };

  const mapEditorToQuestions = (editorQuestions: any[], type: string) => {
    switch (type) {
      case TemplateTypes.FLASHCARDS:
        return editorQuestions.map((q: any) => ({
          ...q,
          cardFront: q.front,
          cardBack: q.back,
          prompt: q.front, // Sync prompt for consistency
          explanation: q.back
        }));
      case TemplateTypes.DRAG_DROP:
        return editorQuestions.map((q: any) => ({
          ...q,
          dragItems: q.dragItems,
          dropZones: q.dropZones
        }));
      case TemplateTypes.WORD_CROSS:
        return editorQuestions.map((q: any) => {
          const words = q.words || [];
          const clues = {
            across: words.filter((w: any) => w.direction === 'across').map((w: any) => ({
              number: w.number,
              clue: w.clue,
              answer: w.answer
            })),
            down: words.filter((w: any) => w.direction === 'down').map((w: any) => ({
              number: w.number,
              clue: w.clue,
              answer: w.answer
            }))
          };
          
          const gridWords = words.map((w: any) => ({
            id: w.id,
            startRow: w.startRow || 0,
            startCol: w.startCol || 0,
            direction: w.direction,
            length: w.answer.length,
            answer: w.answer,
            number: w.number
          }));

          return {
            ...q,
            clues,
            crosswordGrid: {
              size: 15, // Default
              words: gridWords,
              cells: [] // We might skip cells generation for now if complex
            }
          };
        });
      case TemplateTypes.MCQ:
        return editorQuestions.map((q: any) => ({
          ...q,
          answers: q.answers
        }));
      default:
        return editorQuestions;
    }
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

    if (!form.title) {
      setError("Title is required.");
      return;
    }

    if (questions.length === 0) {
      setError("Add at least one question/item before saving.");
      return;
    }

    setSaving(true);
    try {
      // Upload new background image if provided
      let backgroundImageUrl: string | undefined = existingBackgroundUrl || undefined;
      if (backgroundImage) {
        const uploadResult = await apiUploadImage(backgroundImage);
        backgroundImageUrl = uploadResult.url;
      }

      // Map back to backend format
      const questionsToSave = mapEditorToQuestions(questions, selectedTemplate.type);

      await apiPatch(`/games/${id}`, {
        title: form.title,
        description: form.description,
        backgroundImageUrl,
        settings: {
          ...templateConfig,
          timeLimitMinutes: form.timeLimitMinutes,
          randomizeQuestions: form.randomizeQuestions,
          randomizeAnswers: form.randomizeAnswers,
          passingScore: form.passingScore,
          reviewAfterSubmission: form.reviewAfterSubmission
        },
        // Note: The backend update method might not support deep updating of questions
        // depending on implementation. If it fails, we might need a specific endpoint
        // or a different approach (delete + create, or better backend support).
        questions: questionsToSave
      });

      navigate("/educator/games");
    } catch (err: any) {
      setError(err.message || "Failed to save game");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="educator" title="Edit Game">
        <Card>
          <div className="text-center py-8">Loading game data...</div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="educator" title="Edit Game">
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
              if (!file) {
                setExistingBackgroundUrl(null);
              }
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

      {/* Template Info (Read-only) */}
      <Card title="Template Information">
        <div className="p-4 bg-gray-50 rounded-lg">
           <div className="font-semibold text-gray-800">{selectedTemplate?.name}</div>
           <div className="text-sm text-gray-600 mt-1">{selectedTemplate?.description}</div>
           <div className="mt-2 text-xs text-gray-500">Template cannot be changed after creation.</div>
        </div>
      </Card>

      {/* Template Editor */}
      {selectedTemplate && (
        <Card title={`Edit Content`}>
          {renderEditor()}
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mb-8">
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
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-8">
          {error}
        </div>
      )}
    </DashboardLayout>
  );
}