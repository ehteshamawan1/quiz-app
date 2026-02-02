import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card } from "@nursequest/ui-components";
import { apiGet, apiPost } from "../../utils/api";

type AssignedGame = {
  gameId: string;
  assignmentId: string;
  title: string;
  description?: string;
  questionCount: number;
  startsAt?: string;
  dueAt?: string;
  status: "not_started" | "in_progress" | "completed";
  attemptCount: number;
  bestScore: number | null;
  bestAttemptNumber: number | null;
  lastAttemptDate: string | null;
  canRetake: boolean;
  inProgressSessionId: string | null;
};

export default function AssignedGamesPage() {
  const [games, setGames] = useState<AssignedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiGet<AssignedGame[]>("/student/assigned-games")
      .then(setGames)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStartGame = async (gameId: string, assignmentId: string) => {
    try {
      const session = await apiPost<{ id: string }>("/gameplay/sessions/start", {
        gameId,
        assignmentId
      });
      navigate(`/student/games/${gameId}/play?session=${session.id}`);
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Failed to start game. Please try again.");
    }
  };

  const handleResumeGame = (gameId: string, sessionId: string) => {
    navigate(`/student/games/${gameId}/play?session=${sessionId}`);
  };

  const handleViewResults = (sessionId: string) => {
    navigate(`/student/games/sessions/${sessionId}/results`);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      not_started: { text: "Not Started", className: "badge badge--default" },
      in_progress: { text: "In Progress", className: "badge badge--warning" },
      completed: { text: "Completed", className: "badge badge--success" }
    };
    return badges[status as keyof typeof badges] || badges.not_started;
  };

  if (loading) {
    return (
      <DashboardLayout role="student" title="My Assigned Games">
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="My Assigned Games">
      {games.length === 0 ? (
        <Card title="No Games Assigned">
          <p className="text-gray-500">You don't have any games assigned yet. Check back later!</p>
        </Card>
      ) : (
        <div className="games-grid">
          {games.map((game) => {
            const badge = getStatusBadge(game.status);
            const isDue = game.dueAt && new Date(game.dueAt) < new Date();

            return (
              <div key={game.gameId} className="game-card-new">
                <div className="game-card-new__header">
                  <h3 className="game-card-new__title">{game.title}</h3>
                  <span className={badge.className}>{badge.text}</span>
                </div>

                <div className="game-card-new__body">
                  {game.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{game.description}</p>
                  )}
                  
                  <div className="game-card-new__meta mt-auto">
                    <span>{game.questionCount} Questions</span>
                    <span>{game.attemptCount} / 3 Attempts</span>
                  </div>

                  {game.dueAt && (
                    <div className={`text-xs font-semibold ${isDue && game.status !== 'completed' ? 'text-red-600' : 'text-gray-500'}`}>
                      Due: {new Date(game.dueAt).toLocaleDateString()}
                    </div>
                  )}
                  
                  {game.bestScore !== null && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Best Score</span>
                        <span className="font-bold">{Number(game.bestScore).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${Number(game.bestScore) >= 70 ? 'bg-green-500' : 'bg-red-500'}`} 
                          style={{ width: `${Number(game.bestScore)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="game-card-new__footer">
                  {game.status === "in_progress" && game.inProgressSessionId ? (
                    <button
                      className="btn btn--primary"
                      onClick={() => handleResumeGame(game.gameId, game.inProgressSessionId!)}
                    >
                      Resume Game
                    </button>
                  ) : game.status === "not_started" ? (
                    <button
                      className="btn btn--primary"
                      onClick={() => handleStartGame(game.gameId, game.assignmentId)}
                    >
                      Start Game
                    </button>
                  ) : game.canRetake ? (
                    <button
                      className="btn btn--secondary"
                      onClick={() => handleStartGame(game.gameId, game.assignmentId)}
                    >
                      Retake Game
                    </button>
                  ) : (
                    <button className="btn btn--disabled" disabled>
                      Max Attempts Reached
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
