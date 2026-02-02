import { useState } from "react";
import ImageUpload from "../shared/ImageUpload";
import { apiUploadImage } from "../../utils/api";
import { appConfig } from "../../config/app.config";

export interface FlashcardData {
  id: string;
  front: string;
  back: string;
  imageUrl?: string;
}

interface FlashcardEditorProps {
  cards: FlashcardData[];
  onChange: (cards: FlashcardData[]) => void;
  config?: {
    includeImages?: boolean;
    shuffleCards?: boolean;
    selfRating?: boolean;
  };
  onConfigChange?: (config: any) => void;
}

export default function FlashcardEditor({ cards, onChange, config, onConfigChange }: FlashcardEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploadingCards, setUploadingCards] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const handleAddCard = () => {
    const newCard: FlashcardData = {
      id: `card-${Date.now()}`,
      front: "",
      back: "",
      imageUrl: ""
    };
    onChange([...cards, newCard]);
    setEditingIndex(cards.length);
  };

  const handleUpdateCard = (index: number, field: keyof FlashcardData, value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleImageChange = async (index: number, file: File | null) => {
    const card = cards[index];
    if (!card) return;

    if (!file) {
      handleUpdateCard(index, "imageUrl", "");
      setUploadErrors((prev) => ({ ...prev, [card.id]: "" }));
      return;
    }

    setUploadingCards((prev) => ({ ...prev, [card.id]: true }));
    setUploadErrors((prev) => ({ ...prev, [card.id]: "" }));

    try {
      const uploadResult = await apiUploadImage(file);
      handleUpdateCard(index, "imageUrl", uploadResult.url);
    } catch (err: any) {
      setUploadErrors((prev) => ({
        ...prev,
        [card.id]: err?.message || "Failed to upload image"
      }));
    } finally {
      setUploadingCards((prev) => ({ ...prev, [card.id]: false }));
    }
  };

  const handleDeleteCard = (index: number) => {
    const updated = cards.filter((_, i) => i !== index);
    onChange(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleDuplicate = (index: number) => {
    const cardToDuplicate = cards[index];
    const duplicated: FlashcardData = {
      ...cardToDuplicate,
      id: `card-${Date.now()}`,
      front: `${cardToDuplicate.front} (Copy)`
    };
    onChange([...cards, duplicated]);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Options */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Flashcard Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config?.includeImages ?? true}
              onChange={(e) =>
                onConfigChange?.({ ...config, includeImages: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm">Allow images on flashcards</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config?.shuffleCards ?? true}
              onChange={(e) =>
                onConfigChange?.({ ...config, shuffleCards: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm">Shuffle cards for each student</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config?.selfRating ?? true}
              onChange={(e) =>
                onConfigChange?.({ ...config, selfRating: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm">Enable self-rating (Easy/Medium/Hard)</span>
          </label>
        </div>
      </div>

      {/* Cards List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Flashcards ({cards.length})</h3>
          <button
            onClick={handleAddCard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Flashcard
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No flashcards yet. Click "Add Flashcard" to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600">Card {index + 1}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {editingIndex === index ? "Collapse" : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDuplicate(index)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDeleteCard(index)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingIndex === index ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Front (Question/Term)
                      </label>
                      <textarea
                        value={card.front}
                        onChange={(e) => handleUpdateCard(index, "front", e.target.value)}
                        placeholder="Enter the question or term..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Back (Answer/Definition)
                      </label>
                      <textarea
                        value={card.back}
                        onChange={(e) => handleUpdateCard(index, "back", e.target.value)}
                        placeholder="Enter the answer or definition..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    {config?.includeImages && (
                      <div>
                        <ImageUpload
                          label="Flashcard Image (Optional)"
                          value={
                            card.imageUrl
                              ? card.imageUrl.startsWith("http")
                                ? card.imageUrl
                                : `${appConfig.apiUrl}${card.imageUrl}`
                              : undefined
                          }
                          onChange={(file) => handleImageChange(index, file)}
                        />
                        {uploadingCards[card.id] && (
                          <div className="mt-2 text-sm text-gray-600">Uploading image...</div>
                        )}
                        {uploadErrors[card.id] && (
                          <div className="mt-2 text-sm text-red-600">{uploadErrors[card.id]}</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Front</div>
                      <div className="text-gray-800 truncate">{card.front || "(Empty)"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Back</div>
                      <div className="text-gray-800 truncate">{card.back || "(Empty)"}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips for Creating Flashcards</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>- Keep the front concise - usually just a term or short question</li>
          <li>- Provide clear, complete answers on the back</li>
          <li>- Use images to enhance visual learning when applicable</li>
          <li>- Create 10-30 cards for an effective study session</li>
        </ul>
      </div>
    </div>
  );
}

