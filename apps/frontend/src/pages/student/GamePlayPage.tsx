import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet, apiPost } from "../../utils/api";
import { TemplateTypes } from "@nursequest/shared";
import { appConfig } from "../../config/app.config";

// Template Players
import FlashcardsPlayer from "../../components/gameplay/flashcards/FlashcardsPlayer";
import HintDiscoveryPlayer from "../../components/gameplay/hint-discovery/HintDiscoveryPlayer";
import TimedQuizPlayer from "../../components/gameplay/timed-quiz/TimedQuizPlayer";
import DragDropPlayer from "../../components/gameplay/drag-drop/DragDropPlayer";
import WordCrossPlayer from "../../components/gameplay/word-cross/WordCrossPlayer";
import MCQPlayer from "../../components/gameplay/mcq/MCQPlayer";

export default function GamePlayPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      navigate("/student/games");
      return;
    }

    loadGameSession();
  }, [sessionId]);

  const loadGameSession = async () => {
    if (!sessionId) return;

    try {
      // Get session info
      const sessionData = await apiGet<any>(`/gameplay/sessions/${sessionId}`);
      setSession(sessionData);

      // Get game with questions (via secure gameplay endpoint)
      const gameData = await apiGet<any>(`/gameplay/sessions/${sessionId}/game`);
      if (gameData.backgroundImageUrl && !gameData.backgroundImageUrl.startsWith("http")) {
        gameData.backgroundImageUrl = `${appConfig.apiUrl}${gameData.backgroundImageUrl}`;
      }
      setGame(gameData);
      setQuestions(gameData.questions || []);

      setLoading(false);
    } catch (err: any) {
      console.error("Failed to load game:", err);
      setError("Failed to load game. It may have been deleted or you don't have access.");
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (
    questionId: string,
    answer: any,
    timeSpent: number,
    isCorrect?: boolean
  ) => {
    if (!sessionId) return;

    let selectedAnswerIds: string[] = [];

    // Normalize answer input based on different player implementations
    if (Array.isArray(answer)) {
      selectedAnswerIds = answer; // MCQPlayer passes array directly
    } else if (answer?.selectedAnswerIds) {
      selectedAnswerIds = answer.selectedAnswerIds; // HintDiscoveryPlayer wraps in object
    } else if (answer?.selectedAnswerId) {
      selectedAnswerIds = [answer.selectedAnswerId]; // TimedQuizPlayer wraps in object
    } else if (answer?.placement) {
      selectedAnswerIds = answer.placement; // Drag & Drop
    } else if (answer?.userAnswers) {
      selectedAnswerIds = answer.userAnswers; // Word Cross
    }
    // Note: DragDrop and WordCross might need specific handling if they don't map to IDs easily.
    // For now, assuming they might not work fully without backend updates for non-ID answers.

    try {
      await apiPost("/gameplay/answers/submit", {
        sessionId,
        questionId,
        selectedAnswerIds,
        timeSpentSeconds: timeSpent
      });
    } catch (err) {
      console.error("Failed to submit answer:", err);
    }
  };

  const handleComplete = async () => {
    if (!sessionId || submitting) return;

    setSubmitting(true);
    const startedAt = new Date(session.startedAt).getTime();
    const now = Date.now();
    // Ensure positive integer
    const totalTimeSpentSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));

    try {
      await apiPost(`/gameplay/sessions/complete`, {
        sessionId,
        totalTimeSpentSeconds
      });

      // Navigate to results page
      navigate(`/student/games/sessions/${sessionId}/results`);
    } catch (err) {
      console.error("Failed to complete game:", err);
      alert("Failed to save game progress. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 font-semibold mb-4">{error || "Game not found"}</div>
          <button
            onClick={() => navigate("/student/games")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  // Route to appropriate template player
  const renderPlayer = () => {
    const templateType = game.templateType || game.template?.type || TemplateTypes.MCQ;

    switch (templateType) {
      case TemplateTypes.FLASHCARDS:
        return (
          <FlashcardsPlayer
            questions={questions.map((q: any) => ({
              id: q.id,
              front: q.cardFront || q.prompt,
              back: q.cardBack || q.explanation,
              imageUrl: q.imageUrl
            }))}
            config={game.settings}
            game={game}
            onComplete={(ratings) => {
              // For flashcards, just complete without traditional scoring
              handleComplete();
            }}
          />
        );

      case TemplateTypes.HINT_DISCOVERY:
        return (
          <HintDiscoveryPlayer
            questions={questions.map((q: any) => ({
              id: q.id,
              prompt: q.prompt,
              answers: q.answers || [],
              hints: q.hints || [],
              explanation: q.explanation,
              allowMultiple: q.allowMultiple || false
            }))}
            config={game.settings}
            game={game}
            onSubmitAnswer={(questionId, selectedAnswerIds, hintsUsed, pointsEarned) => {
              handleSubmitAnswer(questionId, { selectedAnswerIds, hintsUsed }, pointsEarned);
            }}
            onComplete={handleComplete}
          />
        );

      case TemplateTypes.TIMED_QUIZ:
        return (
          <TimedQuizPlayer
            questions={questions.map((q: any) => ({
              id: q.id,
              prompt: q.prompt,
              answers: q.answers || [],
              explanation: q.explanation
            }))}
            config={game.settings}
            game={game}
            onSubmitAnswer={(questionId, selectedAnswerId, timeSpent, isCorrect) => {
              handleSubmitAnswer(questionId, { selectedAnswerId }, timeSpent, isCorrect);
            }}
            onComplete={(totalScore, streak) => {
              handleComplete();
            }}
          />
        );

      case TemplateTypes.DRAG_DROP:
        return (
          <DragDropPlayer
            questions={questions.map((q: any) => ({
              id: q.id,
              prompt: q.prompt,
              dragItems: q.dragItems || [],
              dropZones: q.dropZones || [],
              explanation: q.explanation
            }))}
            config={game.settings}
            game={game}
            onSubmitAnswer={(questionId, placement, isCorrect) => {
              handleSubmitAnswer(questionId, { placement }, 0, isCorrect);
            }}
            onComplete={handleComplete}
          />
        );

      case TemplateTypes.WORD_CROSS:
        console.log("Rendering WordCrossPlayer");
        return (
          <>
            <WordCrossPlayer
              questions={questions.map((q: any) => {
              const crossGrid = q.crosswordGrid || q.crossword_grid || {};
              const words = crossGrid.words || [];
              const gridSize = crossGrid.size || 15;
              let gridCells = crossGrid.cells || [];

              // Always generate grid cells to ensure consistency and fix display issues
              const cells = [];
              // Initialize grid
              for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                  cells.push({ row: r, col: c, letter: '', isBlack: true, number: undefined });
                }
              }
              
              // Fill words
              if (words.length > 0) {
                words.forEach((w: any) => {
                  const startRow = parseInt(w.startRow) || 0;
                  const startCol = parseInt(w.startCol) || 0;
                  const answer = w.answer || "";
                  
                  const startCellIndex = startRow * gridSize + startCol;
                  if (cells[startCellIndex]) {
                    cells[startCellIndex].number = w.number || undefined;
                  }

                  for (let i = 0; i < answer.length; i++) {
                    const r = w.direction === 'down' ? startRow + i : startRow;
                    const c = w.direction === 'across' ? startCol + i : startCol;
                    const cellIndex = r * gridSize + c;
                    
                    // Boundary check
                    if (r < gridSize && c < gridSize && cells[cellIndex]) {
                      cells[cellIndex].letter = answer[i];
                      cells[cellIndex].isBlack = false;
                    }
                  }
                });
              }
              gridCells = cells;

              const cluesObj = q.clues || {};
              const acrossClues = (cluesObj.across || []).map((c: any) => ({ ...c, direction: 'across' }));
              const downClues = (cluesObj.down || []).map((c: any) => ({ ...c, direction: 'down' }));
              const allClues = [...acrossClues, ...downClues];

              return {
                id: q.id,
                prompt: q.prompt,
                grid: gridCells,
                words: words,
                clues: allClues
              };
            })}
            config={game.settings}
            game={game}
            onSubmitAnswer={(questionId, userAnswers, isCorrect) => {
              handleSubmitAnswer(questionId, { userAnswers }, 0, isCorrect);
            }}
            onComplete={handleComplete}
          />
          </>
        );

      case TemplateTypes.MCQ:
        return (
          <MCQPlayer
            questions={questions.map((q: any) => ({
              id: q.id,
              prompt: q.prompt,
              answers: q.answers || [],
              explanation: q.explanation,
              allowMultiple: q.allowMultiple || false
            }))}
            initialIndex={session.currentQuestionIndex || 0}
            config={game.settings}
            game={game}
            onSubmitAnswer={(questionId, selectedAnswerIds, timeSpent) => {
              handleSubmitAnswer(questionId, selectedAnswerIds, timeSpent);
            }}
            onComplete={handleComplete}
          />
        );

      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-600 mb-4">
                This template type ({templateType}) is not yet supported.
              </div>
              <button
                onClick={() => navigate("/student/games")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Games
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Game Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{game.title}</h1>
              {game.description && (
                <p className="text-sm text-gray-600 mt-1">{game.description}</p>
              )}
            </div>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to exit? Your progress will be saved.")) {
                  navigate("/student/games");
                }
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Game Player */}
      {renderPlayer()}
      
      {/* Submitting Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-semibold">Saving your progress...</p>
          </div>
        </div>
      )}
    </div>
  );
}
