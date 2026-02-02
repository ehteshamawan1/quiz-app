import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button, Card } from "@nursequest/ui-components";
import { apiGet, apiPost, apiDelete } from "../../utils/api";

interface Game {
  id: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
  templateId: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const navigate = useNavigate();

  const load = () => {
    apiGet<Game[]>("/games")
      .then(setGames)
      .catch(() => null);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (gameId: string) => {
    if (confirm("Are you sure you want to delete this game? This cannot be undone.")) {
      try {
        await apiDelete(`/games/${gameId}`);
        load();
      } catch (error) {
        alert("Failed to delete game");
      }
    }
  };

  return (
    <DashboardLayout role="educator" title="Game Library">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <Button onClick={() => navigate("/educator/games/create")}>Create New Game</Button>
      </div>
      
      <Card title="Your Games">
        {games.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
            <p>You haven't created any games yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td style={{ fontWeight: 500 }}>{game.title}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        backgroundColor: game.isPublished ? "#dcfce7" : "#f3f4f6",
                        color: game.isPublished ? "#166534" : "#374151",
                        fontWeight: 600
                      }}
                    >
                      {game.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                    {new Date(game.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <Button variant="ghost" onClick={() => navigate(`/educator/games/edit/${game.id}`)}>
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => apiPost(`/games/${game.id}/duplicate`, {}).then(load)}>
                        Duplicate
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleDelete(game.id)}
                        style={{ color: "var(--color-error)" }}
                      >
                        Delete
                      </Button>
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
