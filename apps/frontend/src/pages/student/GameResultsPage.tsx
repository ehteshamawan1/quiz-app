import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@nursequest/ui-components";
import { apiGet, apiPost } from "../../utils/api";

type Answer = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type QuestionResult = {
  questionId: string;
  prompt: string;
  selectedAnswerIds: string[];
  correctAnswerIds: string[];
  isCorrect: boolean;
  pointsEarned: number;
  explanation?: string;
  answers: Answer[];
};

type ResultsData = {
  sessionId: string;
  gameId: string;
  gameTitle: string;
  totalScore: number;
  percentageScore: number;
  timeSpentSeconds: number;
  attemptNumber: number;
  isBestAttempt: boolean;
  passed: boolean;
  completedAt: string;
  questionResults: QuestionResult[];
};

export default function GameResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retaking, setRetaking] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      navigate("/student/games");
      return;
    }

    apiGet<ResultsData>(`/gameplay/sessions/${sessionId}/results`)
      .then(setResults)
      .catch((error) => {
        console.error("Failed to load results:", error);
        alert("Failed to load results");
        navigate("/student/games");
      })
      .finally(() => setLoading(false));
  }, [sessionId, navigate]);

  const handleRetake = async () => {
    if (!results) return;

    setRetaking(true);
    try {
      const session = await apiPost<{ id: string }>("/gameplay/sessions/start", {
        gameId: results.gameId
      });
      navigate(`/student/games/${results.gameId}/play?session=${session.id}`);
    } catch (error) {
      console.error("Failed to start retake:", error);
      alert("Failed to start retake. You may have reached the maximum attempt limit.");
      setRetaking(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="results-container">
        <div>Loading results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-container">
        <div>Failed to load results</div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>{results.gameTitle} - Results</h1>
        <div className={`results-status ${results.passed ? "results-status--passed" : "results-status--failed"}`}>
          {results.passed ? "✓ PASSED" : "✗ FAILED"}
        </div>
      </div>

      <div className="results-summary">
        <Card title="Score Summary">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Your Score</span>
              <span className="summary-value">{Number(results.percentageScore).toFixed(1)}%</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Points Earned</span>
              <span className="summary-value">{results.totalScore}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Time Spent</span>
              <span className="summary-value">{formatTime(results.timeSpentSeconds)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Attempt</span>
              <span className="summary-value">
                {results.attemptNumber} / 3
                {results.isBestAttempt && <span className="badge badge--success">Best</span>}
              </span>
            </div>
          </div>

          <div className="results-message">
            {results.passed ? (
              <p className="results-message--success">
                Congratulations! You passed with {Number(results.percentageScore).toFixed(1)}%.
                {results.isBestAttempt && " This is your best attempt!"}
              </p>
            ) : (
              <p className="results-message--warning">
                You need 70% to pass. You scored {Number(results.percentageScore).toFixed(1)}%.
                {results.attemptNumber < 3 && " You can retake this game."}
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card title="Question Breakdown">
        <div className="question-breakdown">
          {results.questionResults.map((result, index) => (
            <div key={result.questionId} className="question-result">
              <div className="question-result__header">
                <span className="question-result__number">Question {index + 1}</span>
                <span className={`question-result__status ${result.isCorrect ? "correct" : "incorrect"}`}>
                  {result.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                </span>
                <span className="question-result__points">
                  {result.pointsEarned} points
                </span>
              </div>

              <div
                className="question-result__prompt"
                dangerouslySetInnerHTML={{ __html: result.prompt }}
              />

              <div className="question-result__answers">
                {result.answers.map((answer) => {
                  const isSelected = result.selectedAnswerIds.includes(answer.id);
                  const isCorrect = answer.isCorrect;

                  let className = "answer-result";
                  if (isCorrect) {
                    className += " answer-result--correct";
                  } else if (isSelected && !isCorrect) {
                    className += " answer-result--incorrect";
                  }

                  return (
                    <div key={answer.id} className={className}>
                      <span className="answer-result__text">{answer.text}</span>
                      {isSelected && <span className="answer-result__badge">Your Answer</span>}
                      {isCorrect && <span className="answer-result__badge answer-result__badge--correct">Correct</span>}
                    </div>
                  );
                })}
              </div>

              {result.explanation && (
                <div className="question-result__explanation">
                  <strong>Explanation:</strong> {result.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="results-actions">
        <button
          className="btn btn--secondary"
          onClick={() => navigate("/student/games")}
        >
          Back to My Games
        </button>

        {results.attemptNumber < 3 && (
          <button
            className="btn btn--primary"
            onClick={handleRetake}
            disabled={retaking}
          >
            {retaking ? "Starting..." : `Retake (${3 - results.attemptNumber} attempts left)`}
          </button>
        )}
      </div>
    </div>
  );
}
