# Internal Requirements & Decisions (No Client Inputs)

## Document Purpose
This document replaces client-provided requirements. All branding, content, rules, and datasets will be created internally. Domain and hosting will be provided later, after local testing.

---

## Project Inputs (Owned Internally)

### 1) Branding & Product Identity
- Product name: NurseQuest
- Logo: info/assets/logo.svg
- Colors and typography: defined in info/CLIENT_CHECKLIST.md
- Tone: friendly, academic, calm

### 2) Technical Access & Accounts
- Domain/hosting: deferred until post-development
- DNS access: not required during development
- Email service: not provided; outbound email disabled until later
- Use local mail catcher for dev/QA (MailHog/Mailpit)
- Authentication: JWT-based with admin-created credentials
- Account data: username + password required, email optional

### 3) Educational Content
- MCQ bank (initial 150 questions)
- Explanations and hints for each question
- Terminology list (200 terms)
- Misconceptions list (20 items)
- Optional references (publicly available sources, properly cited)

### 4) Rules & UX
- Scoring rules, hint penalties, and time bonus defined internally (no time bonus in Rapid-Fire)
- Feedback rules defined internally
- Accessibility baseline: WCAG 2.1 AA

### 5) Sample Data
- Demo institutions, classes, educators, and students
- Seed demo users/classes during development as needed
- CSV seed files to support bulk import workflows

---

## Phase-Based Internal Inputs

### Phase 1: Foundation
- Finalize branding, color system, typography
- Define base UI components and design tokens
- Define user roles and permissions matrix

### Phase 2: Admin & Educator Portal
- Deliver MCQ content set v1 (>= 50 for template validation)
- Define grouping logic (institution > program > class)
- Draft scoring rubric and hint expectations

### Phase 3: Student Portal & Gameplay
- Define gameplay flow and hint timing
- Define feedback screen and progress metrics
- Provide sample class and assignment data

### Phase 4: Additional Templates & Analytics
- Expand content sets for new templates
- Define analytics metrics and report formats
- Confirm all templates in scope (no prioritization)

### Phase 5: Testing & Launch
- UAT plan executed internally
- Final QA and performance checks
- Hosting/domain handoff when client provides access

---

## Risks & Mitigations

### Content Creation Risk
- Risk: Internal content creation delays
- Mitigation: Start curation immediately; use staged releases

### Email Workflow Risk
- Risk: No outbound email provider during development
- Mitigation: Use local mail catcher and feature flags

### Hosting Delay Risk
- Risk: Domain/hosting access provided late
- Mitigation: Maintain local and staging environments until handoff

---

**Last Updated:** 2026-01-06
