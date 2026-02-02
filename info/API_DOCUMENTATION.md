# API Documentation (Phases 1-4 Complete)

Base URL: `/`

**Authentication:** Most endpoints require JWT token in Authorization header: `Bearer <token>`

**Roles:** admin, educator, student

## Auth

### POST /auth/register
Create a new user (admin-created accounts can complete setup here).

Body:
```
{
  "username": "string",
  "email": "string (optional)",
  "password": "string"
}
```

### POST /auth/login
Body:
```
{
  "username": "string",
  "password": "string"
}
```

### POST /auth/forgot-password
Body:
```
{
  "identifier": "string"
}
```
Returns a reset token for local development.

### POST /auth/reset-password
Body:
```
{
  "token": "string",
  "password": "string"
}
```

## Users (Admin)

### GET /users
List users

### POST /users
Create user
Body supports `collegeId`

### PATCH /users/:id
Update user

### DELETE /users/:id
Delete user

### POST /users/bulk
Bulk import users from CSV (body: { "csv": "..." })
CSV columns supported: username,email,role,password,college_id,is_active

## Colleges (Admin)

### GET /colleges
### POST /colleges
### PATCH /colleges/:id
### DELETE /colleges/:id

## Groups (Educator/Admin)

### GET /groups
### POST /groups
### PATCH /groups/:id
### DELETE /groups/:id

## Templates (Admin)

### GET /templates
### POST /templates
Body supports `category`, `difficulty`
### PATCH /templates/:id
### DELETE /templates/:id
### POST /templates/:id/clone
### GET /templates/:id/preview

## Games (Educator)

### GET /games
### POST /games
Body supports MCQ settings in `settings`
### PATCH /games/:id
### DELETE /games/:id
### POST /games/:id/duplicate

### POST /games/assign
Assign game to group

## Question Bank (Educator)

### GET /question-bank
### POST /question-bank
Body supports `topic` and `tags`
### PATCH /question-bank/:id
### DELETE /question-bank/:id

## Settings (Admin)

### GET /settings
### PUT /settings/:key
### DELETE /settings/:key

## Admin Overview (Admin)

### GET /admin/overview

## Educator Overview (Educator)

### GET /educator/overview

---

## Phase 3 - Gameplay Engine

### Student Endpoints

#### GET /student/dashboard
Get student dashboard with assigned games, scores, and recent activity
**Auth:** Student role required

#### GET /student/assigned-games
List all games assigned to the student
**Auth:** Student role required

#### GET /student/profile
Get student profile and score history
**Auth:** Student role required

### Gameplay Endpoints

#### POST /gameplay/sessions
Start a new game session
**Auth:** Student role required
**Body:**
```json
{
  "gameId": "uuid",
  "studentId": "uuid"
}
```
**Returns:** Session ID, game data, questions

#### GET /gameplay/sessions/:sessionId
Get session details and progress
**Auth:** Student role (owner only)

#### POST /gameplay/submit-answer
Submit answer for a question
**Auth:** Student role required
**Body:**
```json
{
  "sessionId": "uuid",
  "questionId": "uuid",
  "answer": ["answerId1", "answerId2"],
  "timeSpentSeconds": 30
}
```
**Returns:** Correctness, points earned, explanation

#### POST /gameplay/reveal-hint
Reveal a hint for a question
**Auth:** Student role required
**Body:**
```json
{
  "sessionId": "uuid",
  "questionId": "uuid",
  "hintId": "uuid"
}
```
**Returns:** Hint text, penalty applied

#### POST /gameplay/sessions/:sessionId/complete
Complete a game session
**Auth:** Student role required
**Body:**
```json
{
  "totalTimeSpentSeconds": 1200
}
```
**Returns:** Final score, percentage, pass/fail

#### GET /gameplay/sessions/:sessionId/results
Get detailed results for a completed session
**Auth:** Student role required
**Returns:** Score breakdown, question-by-question results

---

## Phase 4 - Analytics & Reporting

### Analytics Endpoints (Educator/Admin)

#### GET /analytics/games/:gameId
Get comprehensive game analytics
**Auth:** Educator/Admin role required
**Query Params:** startDate, endDate (optional)
**Returns:**
- Total attempts
- Completion rate
- Average score and time
- Score distribution
- Question difficulty analysis

#### GET /analytics/students/:studentId
Get student performance analytics
**Auth:** Educator/Admin role required
**Query Params:** startDate, endDate (optional)
**Returns:**
- Games completed
- Average score
- Pass rate
- Time spent
- Score history

#### GET /analytics/groups/:groupId
Get group/class analytics
**Auth:** Educator/Admin role required
**Returns:**
- Total students
- Completion rate
- Average score
- Top performers
- Students needing help

#### GET /analytics/questions/:gameId/difficulty
Get question-level difficulty analysis
**Auth:** Educator/Admin role required
**Returns:** Array of questions with error rates, average time, common wrong answers

#### GET /analytics/overview
Get educator overview dashboard
**Auth:** Educator/Admin role required
**Returns:**
- Active games count
- Total students
- Average class score
- Recent activity

#### GET /analytics/trends/:gameId
Get score trends over time
**Auth:** Educator/Admin role required
**Query Params:** startDate, endDate (optional)
**Returns:** Time-series data for score trends

#### GET /analytics/assignments/:assignmentId
Get assignment analytics
**Auth:** Educator/Admin role required
**Returns:**
- Total students assigned
- Submitted count
- Pending count
- Average score
- Completion trend

### Export Endpoints (Educator/Admin)

#### POST /export
Generic export endpoint
**Auth:** Educator/Admin role required
**Body:**
```json
{
  "type": "game" | "student" | "assignment",
  "entityId": "uuid",
  "format": "pdf" | "csv",
  "dateRange": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  }
}
```
**Returns:** File download (Content-Disposition header)

#### POST /export/game/:gameId/:format
Export game results (pdf or csv)
**Auth:** Educator/Admin role required

#### POST /export/student/:studentId/:format
Export student performance report
**Auth:** Educator/Admin role required

#### POST /export/assignment/:assignmentId/:format
Export assignment results
**Auth:** Educator/Admin role required
