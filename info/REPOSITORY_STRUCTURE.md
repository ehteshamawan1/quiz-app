# Repository Structure - NurseQuest

## Client Input Update (2026-01-06)
- Internal-use product; no client branding or content will be provided
- Domain/hosting will be provided after development and local testing

## Overview
This document outlines the complete folder structure for the NurseQuest project, including both frontend and backend repositories.

---

## Monorepo vs Multi-Repo Approach

### Recommended: Monorepo Structure
Using a monorepo allows for better code sharing, unified versioning, and simplified development workflow.

```
quiz-app/
├── apps/
│   ├── frontend/          # React frontend application
│   ├── backend/           # NestJS/Express backend application
│   └── admin-portal/      # Separate admin portal (optional)
├── packages/
│   ├── shared/            # Shared utilities and types
│   ├── ui-components/     # Shared UI component library
│   └── game-engine/       # Shared game logic
├── info/                  # Project documentation
├── scripts/               # Build and deployment scripts
├── .github/               # GitHub Actions workflows
└── docs/                  # Additional documentation
```

---

## Detailed Folder Structure

### Root Level
```
quiz-app/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Continuous integration
│   │   ├── cd-staging.yml            # Deploy to staging
│   │   ├── cd-production.yml         # Deploy to production
│   │   └── tests.yml                 # Run tests on PR
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       ├── feature_request.md
│       └── question.md
├── apps/
│   ├── frontend/
│   └── backend/
├── packages/
│   ├── shared/
│   ├── ui-components/
│   └── game-engine/
├── info/
│   ├── EXECUTION_PLAN.md             # This project's execution plan
│   ├── PROGRESS_LOG.md               # Daily progress tracking
│   ├── FEATURE_LIST.md               # Complete feature list
│   ├── REPOSITORY_STRUCTURE.md       # This document
│   ├── CLIENT_REQUIREMENTS.md        # Internal requirements & blockers
│   ├── API_DOCUMENTATION.md          # API endpoints documentation
│   └── DATABASE_SCHEMA.md            # Database design document
├── scripts/
│   ├── setup.sh                      # Initial setup script
│   ├── deploy-staging.sh             # Deploy to staging
│   ├── deploy-production.sh          # Deploy to production
│   ├── seed-database.sh              # Seed test data
│   └── backup-database.sh            # Database backup script
├── docs/
│   ├── user-guides/
│   │   ├── admin-guide.md
│   │   ├── educator-guide.md
│   │   └── student-guide.md
│   ├── developer-guides/
│   │   ├── setup-guide.md
│   │   ├── coding-standards.md
│   │   └── deployment-guide.md
│   └── design/
│       ├── ui-mockups/
│       ├── wireframes/
│       └── design-system.md
├── .gitignore
├── .env.example
├── package.json                      # Root package.json for monorepo
├── tsconfig.json                     # Base TypeScript config
├── README.md                         # Project README
├── LICENSE
└── docker-compose.yml                # Docker setup for local development
```

---

## Frontend Structure (apps/frontend/)

```
apps/frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── logo.png
│   ├── robots.txt
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── fonts/
├── src/
│   ├── assets/                       # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── globals.css
│   │       ├── variables.css
│   │       └── tailwind.css
│   ├── components/                   # Reusable components
│   │   ├── common/                   # Common UI components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Dropdown/
│   │   │   ├── Table/
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   ├── Loader/
│   │   │   └── Toast/
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   ├── Navigation/
│   │   │   └── Container/
│   │   ├── forms/                    # Form components
│   │   │   ├── LoginForm/
│   │   │   ├── RegisterForm/
│   │   │   ├── GameForm/
│   │   │   └── QuestionForm/
│   │   └── game/                     # Game-specific components
│   │       ├── GamePlayer/
│   │       ├── QuestionDisplay/
│   │       ├── HintPanel/
│   │       ├── Timer/
│   │       ├── ScoreBoard/
│   │       └── ResultsScreen/
│   ├── pages/                        # Page components (routes)
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── admin/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CollegesPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── TemplatesPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── educator/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── GamesPage.tsx
│   │   │   ├── CreateGamePage.tsx
│   │   │   ├── EditGamePage.tsx
│   │   │   ├── StudentsPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── ReportsPage.tsx
│   │   ├── student/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── GamesPage.tsx
│   │   │   ├── GamePlayPage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── UnauthorizedPage.tsx
│   ├── features/                     # Feature-based modules
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── types.ts
│   │   ├── games/
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   ├── components/
│   │   │   ├── utils/
│   │   │   └── types.ts
│   │   ├── templates/
│   │   │   ├── MCQTemplate/
│   │   │   ├── HintGameTemplate/
│   │   │   ├── DragDropTemplate/
│   │   │   └── WordCrossTemplate/
│   │   ├── analytics/
│   │   └── users/
│   ├── store/                        # Redux store (if using Redux)
│   │   ├── index.ts
│   │   ├── store.ts
│   │   ├── rootReducer.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── gameSlice.ts
│   │       ├── userSlice.ts
│   │       └── uiSlice.ts
│   ├── api/                          # API layer
│   │   ├── axios.config.ts
│   │   ├── endpoints.ts
│   │   └── services/
│   │       ├── authService.ts
│   │       ├── gameService.ts
│   │       ├── userService.ts
│   │       └── analyticsService.ts
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useGame.ts
│   │   ├── useTimer.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── utils/                        # Utility functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   ├── dateHelpers.ts
│   │   ├── scoreCalculator.ts
│   │   └── constants.ts
│   ├── types/                        # TypeScript types
│   │   ├── user.types.ts
│   │   ├── game.types.ts
│   │   ├── question.types.ts
│   │   ├── template.types.ts
│   │   └── api.types.ts
│   ├── routes/                       # Route configuration
│   │   ├── index.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── PublicRoute.tsx
│   │   └── RoleRoute.tsx
│   ├── contexts/                     # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   ├── config/                       # Configuration files
│   │   ├── app.config.ts
│   │   └── theme.config.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── setupTests.ts
├── tests/                            # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.development
├── .env.staging
├── .env.production
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
├── vite.config.ts                    # Or webpack.config.js
└── README.md
```

---

## Backend Structure (apps/backend/)

```
apps/backend/
├── src/
│   ├── modules/                      # Feature modules (NestJS style)
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── reset-password.dto.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── decorators/
│   │   │       └── roles.decorator.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── repositories/
│   │   │       └── user.repository.ts
│   │   ├── colleges/
│   │   │   ├── colleges.module.ts
│   │   │   ├── colleges.controller.ts
│   │   │   ├── colleges.service.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │       └── college.entity.ts
│   │   ├── games/
│   │   │   ├── games.module.ts
│   │   │   ├── games.controller.ts
│   │   │   ├── games.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-game.dto.ts
│   │   │   │   ├── update-game.dto.ts
│   │   │   │   └── assign-game.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── game.entity.ts
│   │   │   │   ├── question.entity.ts
│   │   │   │   ├── answer.entity.ts
│   │   │   │   └── hint.entity.ts
│   │   │   └── repositories/
│   │   ├── templates/
│   │   │   ├── templates.module.ts
│   │   │   ├── templates.controller.ts
│   │   │   ├── templates.service.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │       └── template.entity.ts
│   │   ├── gameplay/
│   │   │   ├── gameplay.module.ts
│   │   │   ├── gameplay.controller.ts
│   │   │   ├── gameplay.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── start-game.dto.ts
│   │   │   │   ├── submit-answer.dto.ts
│   │   │   │   └── request-hint.dto.ts
│   │   │   └── entities/
│   │   │       ├── game-session.entity.ts
│   │   │       ├── game-attempt.entity.ts
│   │   │       └── answer-submission.entity.ts
│   │   ├── analytics/
│   │   │   ├── analytics.module.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── dto/
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── email/
│   │   │   │   ├── email.service.ts
│   │   │   │   └── templates/
│   │   │   └── dto/
│   │   └── reports/
│   │       ├── reports.module.ts
│   │       ├── reports.controller.ts
│   │       ├── reports.service.ts
│   │       └── generators/
│   │           ├── pdf.generator.ts
│   │           └── csv.generator.ts
│   ├── common/                       # Shared resources
│   │   ├── decorators/
│   │   │   ├── user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── validation.filter.ts
│   │   ├── guards/
│   │   │   └── throttler.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── middleware/
│   │   │   ├── logger.middleware.ts
│   │   │   └── cors.middleware.ts
│   │   └── interfaces/
│   │       └── user-request.interface.ts
│   ├── config/                       # Configuration
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── email.config.ts
│   │   └── app.config.ts
│   ├── database/                     # Database related
│   │   ├── migrations/
│   │   ├── seeds/
│   │   │   ├── colleges.seed.ts
│   │   │   ├── users.seed.ts
│   │   │   └── templates.seed.ts
│   │   └── database.module.ts
│   ├── utils/                        # Utility functions
│   │   ├── hash.util.ts
│   │   ├── jwt.util.ts
│   │   ├── date.util.ts
│   │   └── validation.util.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── test/                             # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│       ├── auth.e2e-spec.ts
│       ├── games.e2e-spec.ts
│       └── users.e2e-spec.ts
├── .env.development
├── .env.staging
├── .env.production
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── nest-cli.json
├── package.json
└── README.md
```

---

## Shared Packages

### packages/shared/
```
packages/shared/
├── src/
│   ├── types/                        # Shared TypeScript types
│   │   ├── user.types.ts
│   │   ├── game.types.ts
│   │   ├── api.types.ts
│   │   └── index.ts
│   ├── constants/                    # Shared constants
│   │   ├── roles.ts
│   │   ├── game-types.ts
│   │   ├── error-codes.ts
│   │   └── index.ts
│   ├── utils/                        # Shared utilities
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### packages/ui-components/
```
packages/ui-components/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── index.ts
│   ├── styles/
│   │   └── index.css
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### packages/game-engine/
```
packages/game-engine/
├── src/
│   ├── engines/
│   │   ├── mcq-engine.ts
│   │   ├── hint-engine.ts
│   │   ├── drag-drop-engine.ts
│   │   └── wordcross-engine.ts
│   ├── scoring/
│   │   ├── score-calculator.ts
│   │   └── penalty-calculator.ts
│   ├── validators/
│   │   ├── answer-validator.ts
│   │   └── game-validator.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## Database Structure

### Database Schema Files
```
apps/backend/src/database/
├── migrations/
│   ├── 001_create_core_tables.sql
│   ├── 002_phase2_tables.sql
│   ├── 003_question_bank.sql
│   ├── 004_system_settings.sql
│   ├── 006_phase2_alterations.sql
│   ├── 007_game_question_multi.sql
│   ├── 008_phase3_gameplay.sql
│   ├── 009_template_types_data.sql
│   ├── 010_drag_drop_fields.sql
│   ├── 011_word_cross_fields.sql
│   └── 012_flashcard_fields.sql
└── seeds/
    ├── dev-seeds/
    └── production-seeds/

**Note:** Migration 005 was consolidated into 002_phase2_tables.sql. SQL files used instead of TypeScript for better portability.
```

---

## Infrastructure & DevOps

### Docker Setup
```
quiz-app/
├── docker/
│   ├── frontend/
│   │   └── Dockerfile
│   ├── backend/
│   │   └── Dockerfile
│   └── nginx/
│       ├── Dockerfile
│       └── nginx.conf
└── docker-compose.yml
```

### CI/CD Configuration
```
.github/workflows/
├── ci.yml                            # Run tests on every PR
├── cd-staging.yml                    # Deploy to staging on merge to develop
├── cd-production.yml                 # Deploy to production on merge to main
├── security-scan.yml                 # Security vulnerability scanning
└── code-quality.yml                  # Code quality checks
```

---

## Environment Variables

### Frontend (.env files)
```
REACT_APP_API_URL=
REACT_APP_ENV=
REACT_APP_VERSION=
```

### Backend (.env files)
```
NODE_ENV=
PORT=
DATABASE_URL=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
REDIS_HOST=
REDIS_PORT=
```

---

## File Naming Conventions

### React Components
- PascalCase for component files: `GamePlayer.tsx`
- camelCase for utility files: `scoreCalculator.ts`
- kebab-case for CSS files: `game-player.module.css`

### Backend Files
- kebab-case for module files: `game-session.module.ts`
- PascalCase for entity files: `GameSession.entity.ts`
- camelCase for service files: `gameSession.service.ts`

---

## Git Branch Strategy

```
main                    # Production-ready code
├── develop             # Development branch
│   ├── feature/auth
│   ├── feature/games
│   ├── feature/analytics
│   ├── bugfix/login-error
│   └── hotfix/critical-bug
```

### Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/bug-name` - Bug fixes
- `hotfix/critical-fix` - Production hotfixes
- `refactor/refactor-name` - Code refactoring
- `docs/doc-name` - Documentation updates

---

## Documentation Location

All project documentation should be placed in:
```
info/                   # Project planning and requirements
docs/                   # User and developer guides
README.md              # Project overview
```

---

## Package Management

### Using npm workspaces or yarn workspaces

Root `package.json`:
```json
{
  "name": "quiz-app",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  }
}
```

---

## Additional Considerations

### Code Quality Tools
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- lint-staged for pre-commit checks
- Commitlint for commit message linting

### Testing Tools
- Jest for unit testing
- React Testing Library for component testing
- Supertest for API testing
- Playwright or Cypress for E2E testing

### Monitoring & Logging
- Sentry for error tracking
- LogRocket for session replay
- DataDog or New Relic for performance monitoring
- Winston or Pino for backend logging
