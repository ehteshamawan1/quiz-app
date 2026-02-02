import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Card, Button, Input } from "@nursequest/ui-components";
import { apiGet, apiPost, apiDelete } from "../../utils/api";

export default function StudentsPage() {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState<Array<{ 
    id: string; 
    name: string; 
    assignments?: Array<{ id: string; game: { title: string } }>;
    memberships?: Array<{ id: string; student: { username: string } }>;
  }>>([]);
  const [games, setGames] = useState<Array<{ id: string; title: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; username: string }>>([]);
  const [assignment, setAssignment] = useState({ gameId: "", groupId: "", dueAt: "" });
  const [studentAssignment, setStudentAssignment] = useState({ groupId: "", studentId: "" });

  const load = () => {
    apiGet<Array<any>>("/groups")
      .then(setGroups)
      .catch(() => null);
    apiGet<Array<{ id: string; title: string }>>("/games")
      .then(setGames)
      .catch(() => null);
    apiGet<Array<{ id: string; username: string }>>("/users/students")
      .then(setStudents)
      .catch(() => null);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUnassign = (assignmentId: string) => {
    if (confirm("Are you sure you want to unassign this game?")) {
      apiDelete(`/games/assignments/${assignmentId}`)
        .then(() => {
          load();
        })
        .catch(() => alert("Failed to unassign game"));
    }
  };

  return (
    <DashboardLayout role="educator" title="Students & Groups">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Create Class Group">
          <div className="form-stack">
            <Input label="Group name" placeholder="Fundamentals - Section A" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            <Button
              type="button"
              onClick={() => {
                if (!groupName.trim()) return;
                apiPost("/groups", { name: groupName }).then(() => {
                  setGroupName("");
                  load();
                });
              }}
            >
              Create group
            </Button>
          </div>
        </Card>
        
        <Card title="Assign Games">
          <div className="form-stack">
            <div className="nq-input">
              <span className="nq-input__label">Select Game</span>
              <select
                className="nq-input__field"
                value={assignment.gameId}
                onChange={(e) => setAssignment({ ...assignment, gameId: e.target.value })}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
              >
                <option value="">-- Choose a game --</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="nq-input">
              <span className="nq-input__label">Select Group</span>
              <select
                className="nq-input__field"
                value={assignment.groupId}
                onChange={(e) => setAssignment({ ...assignment, groupId: e.target.value })}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
              >
                <option value="">-- Choose a group --</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <Input 
              label="Due Date" 
              type="datetime-local" 
              value={assignment.dueAt} 
              onChange={(e) => setAssignment({ ...assignment, dueAt: e.target.value })} 
            />
            
            <Button
              type="button"
              onClick={() => {
                if (!assignment.gameId || !assignment.groupId) return;
                apiPost("/games/assign", { ...assignment }).then(() => {
                  setAssignment({ gameId: "", groupId: "", dueAt: "" });
                  alert("Game assigned successfully!");
                  load();
                });
              }}
              disabled={!assignment.gameId || !assignment.groupId}
            >
              Assign Game
            </Button>
          </div>
        </Card>

        <Card title="Assign Students">
          <div className="form-stack">
            <div className="nq-input">
              <span className="nq-input__label">Select Student</span>
              <select
                className="nq-input__field"
                value={studentAssignment.studentId}
                onChange={(e) => setStudentAssignment({ ...studentAssignment, studentId: e.target.value })}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
              >
                <option value="">-- Choose a student --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="nq-input">
              <span className="nq-input__label">Select Group</span>
              <select
                className="nq-input__field"
                value={studentAssignment.groupId}
                onChange={(e) => setStudentAssignment({ ...studentAssignment, groupId: e.target.value })}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
              >
                <option value="">-- Choose a group --</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Button
              type="button"
              onClick={() => {
                if (!studentAssignment.groupId || !studentAssignment.studentId) return;
                apiPost(`/groups/${studentAssignment.groupId}/students`, { studentId: studentAssignment.studentId }).then(() => {
                  setStudentAssignment({ groupId: "", studentId: "" });
                  alert("Student assigned successfully!");
                  load();
                });
              }}
              disabled={!studentAssignment.groupId || !studentAssignment.studentId}
            >
              Add to Group
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Existing Groups">
          {groups.length === 0 ? (
             <p className="text-gray-500">No groups created yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Assigned Games</th>
                  <th>Students</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td className="font-medium">{group.name}</td>
                    <td>
                      {group.assignments && group.assignments.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {group.assignments.map(a => (
                            <span key={a.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                              {a.game?.title || "Unknown Game"}
                              <button 
                                onClick={() => handleUnassign(a.id)}
                                className="ml-1 text-blue-600 hover:text-blue-900 font-bold px-1 rounded hover:bg-blue-200"
                                title="Unassign game"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No games assigned</span>
                      )}
                    </td>
                    <td>
                      {group.memberships && group.memberships.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {group.memberships.map(m => (
                            <span key={m.id} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {m.student?.username || "Unknown Student"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No students</span>
                      )}
                    </td>
                    <td className="text-sm text-gray-500">{group.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
