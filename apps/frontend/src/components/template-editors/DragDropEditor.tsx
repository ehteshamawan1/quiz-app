import { useState } from "react";

interface DragItem {
  id: string;
  content: string;
  imageUrl?: string;
}

interface DropZoneData {
  id: string;
  label: string;
  correctItemIds: string[];
}

export interface DragDropQuestionData {
  id: string;
  prompt: string;
  dragItems: DragItem[];
  dropZones: DropZoneData[];
  explanation?: string;
}

interface DragDropEditorProps {
  questions: DragDropQuestionData[];
  onChange: (questions: DragDropQuestionData[]) => void;
  config?: {
    dragDropType?: "match" | "sequence" | "label";
    allowMultipleAttempts?: boolean;
    autoValidate?: boolean;
  };
  onConfigChange?: (config: any) => void;
}

export default function DragDropEditor({ questions, onChange, config, onConfigChange }: DragDropEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: DragDropQuestionData = {
      id: `question-${Date.now()}`,
      prompt: "",
      dragItems: [],
      dropZones: [],
      explanation: ""
    };
    onChange([...questions, newQuestion]);
    setEditingIndex(questions.length);
  };

  const handleUpdateQuestion = (index: number, field: keyof DragDropQuestionData, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAddDragItem = (questionIndex: number) => {
    const question = questions[questionIndex];
    const newItem: DragItem = {
      id: `item-${Date.now()}`,
      content: "",
      imageUrl: ""
    };
    handleUpdateQuestion(questionIndex, "dragItems", [...question.dragItems, newItem]);
  };

  const handleUpdateDragItem = (questionIndex: number, itemIndex: number, field: keyof DragItem, value: any) => {
    const question = questions[questionIndex];
    const updatedItems = [...question.dragItems];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], [field]: value };
    handleUpdateQuestion(questionIndex, "dragItems", updatedItems);
  };

  const handleDeleteDragItem = (questionIndex: number, itemIndex: number) => {
    const question = questions[questionIndex];
    const itemId = question.dragItems[itemIndex].id;

    // Remove item
    const updatedItems = question.dragItems.filter((_, i) => i !== itemIndex);

    // Remove from drop zones
    const updatedZones = question.dropZones.map((zone) => ({
      ...zone,
      correctItemIds: zone.correctItemIds.filter((id) => id !== itemId)
    }));

    const updated = [...questions];
    updated[questionIndex] = {
      ...updated[questionIndex],
      dragItems: updatedItems,
      dropZones: updatedZones
    };
    onChange(updated);
  };

  const handleAddDropZone = (questionIndex: number) => {
    const question = questions[questionIndex];
    const newZone: DropZoneData = {
      id: `zone-${Date.now()}`,
      label: "",
      correctItemIds: []
    };
    handleUpdateQuestion(questionIndex, "dropZones", [...question.dropZones, newZone]);
  };

  const handleUpdateDropZone = (questionIndex: number, zoneIndex: number, field: keyof DropZoneData, value: any) => {
    const question = questions[questionIndex];
    const updatedZones = [...question.dropZones];
    updatedZones[zoneIndex] = { ...updatedZones[zoneIndex], [field]: value };
    handleUpdateQuestion(questionIndex, "dropZones", updatedZones);
  };

  const handleDeleteDropZone = (questionIndex: number, zoneIndex: number) => {
    const question = questions[questionIndex];
    const updatedZones = question.dropZones.filter((_, i) => i !== zoneIndex);
    handleUpdateQuestion(questionIndex, "dropZones", updatedZones);
  };

  const handleToggleItemInZone = (questionIndex: number, zoneIndex: number, itemId: string) => {
    const question = questions[questionIndex];
    const zone = question.dropZones[zoneIndex];
    const updatedZones = [...question.dropZones];

    if (zone.correctItemIds.includes(itemId)) {
      updatedZones[zoneIndex] = {
        ...zone,
        correctItemIds: zone.correctItemIds.filter((id) => id !== itemId)
      };
    } else {
      updatedZones[zoneIndex] = {
        ...zone,
        correctItemIds: [...zone.correctItemIds, itemId]
      };
    }

    handleUpdateQuestion(questionIndex, "dropZones", updatedZones);
  };

  const handleDeleteQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Drag & Drop Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={config?.dragDropType ?? "match"}
              onChange={(e) => onConfigChange?.({ ...config, dragDropType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="match">Match to Categories</option>
              <option value="sequence">Sequence Ordering</option>
              <option value="label">Label Diagram</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config?.allowMultipleAttempts ?? false}
                onChange={(e) => onConfigChange?.({ ...config, allowMultipleAttempts: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Allow multiple attempts</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config?.autoValidate ?? true}
                onChange={(e) => onConfigChange?.({ ...config, autoValidate: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Auto-validate when all placed</span>
            </label>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No questions yet. Click "Add Question" to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600">Question {qIndex + 1}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingIndex(editingIndex === qIndex ? null : qIndex)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {editingIndex === qIndex ? "Collapse" : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(qIndex)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingIndex === qIndex ? (
                  <div className="space-y-4">
                    {/* Question Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                      <textarea
                        value={question.prompt}
                        onChange={(e) => handleUpdateQuestion(qIndex, "prompt", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                        placeholder="e.g., Match each organ to its system..."
                      />
                    </div>

                    {/* Draggable Items */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Draggable Items</label>
                        <button
                          onClick={() => handleAddDragItem(qIndex)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + Add Item
                        </button>
                      </div>
                      <div className="space-y-2">
                        {question.dragItems.map((item, iIndex) => (
                          <div key={item.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                            <input
                              type="text"
                              value={item.content}
                              onChange={(e) => handleUpdateDragItem(qIndex, iIndex, "content", e.target.value)}
                              placeholder="Item content..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <input
                              type="url"
                              value={item.imageUrl || ""}
                              onChange={(e) => handleUpdateDragItem(qIndex, iIndex, "imageUrl", e.target.value)}
                              placeholder="Image URL (optional)"
                              className="w-48 px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <button
                              onClick={() => handleDeleteDragItem(qIndex, iIndex)}
                              className="text-red-600 hover:text-red-800 px-2"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Drop Zones */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Drop Zones</label>
                        <button
                          onClick={() => handleAddDropZone(qIndex)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + Add Zone
                        </button>
                      </div>
                      <div className="space-y-3">
                        {question.dropZones.map((zone, zIndex) => (
                          <div key={zone.id} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                value={zone.label}
                                onChange={(e) => handleUpdateDropZone(qIndex, zIndex, "label", e.target.value)}
                                placeholder="Zone label (e.g., Cardiovascular System)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                              />
                              <button
                                onClick={() => handleDeleteDropZone(qIndex, zIndex)}
                                className="text-red-600 hover:text-red-800 px-2"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="text-xs text-gray-600 mb-1">Correct items for this zone:</div>
                            <div className="flex flex-wrap gap-2">
                              {question.dragItems.map((item) => (
                                <label
                                  key={item.id}
                                  className="flex items-center space-x-1 bg-white px-2 py-1 rounded border border-gray-200"
                                >
                                  <input
                                    type="checkbox"
                                    checked={zone.correctItemIds.includes(item.id)}
                                    onChange={() => handleToggleItemInZone(qIndex, zIndex, item.id)}
                                    className="mr-1"
                                  />
                                  <span className="text-xs">{item.content || "Unnamed"}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                      <textarea
                        value={question.explanation || ""}
                        onChange={(e) => handleUpdateQuestion(qIndex, "explanation", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                        placeholder="Explain the correct matches..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-800">
                    <div className="truncate">{question.prompt || "(Empty question)"}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {question.dragItems.length} items, {question.dropZones.length} zones
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips for Drag & Drop</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Create clear, distinct categories/zones</li>
          <li>• Ensure items can only fit in one correct zone</li>
          <li>• Add images to items for visual learning</li>
          <li>• Test the placement yourself before publishing</li>
        </ul>
      </div>
    </div>
  );
}
