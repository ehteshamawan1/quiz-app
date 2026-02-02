# Internal Checklist - Project Inputs (No Client-Provided Materials)

## Purpose
This checklist captures the decisions and assets we will create internally because the client will not provide branding, content, or rules. Use this as the single source of truth for project inputs.

---

## 1) Product Identity

### Name
- Product name: NurseQuest
- Tagline: Nursing learning through play

### Logo
- Create a simple SVG logo based on the name
- File location: info/assets/logo.svg
- Use a text-first lockup to stay neutral for internal use
- Additional sizes can be generated later (512, 256, 64, 32)

### Brand Colors
Use a calm, academic palette with warm accents:
```
Primary:   #1B4B5A  (Deep teal)
Secondary: #2A9D8F  (Teal)
Accent:    #E07A5F  (Coral)
Warning:   #E9C46A  (Amber)
Error:     #E76F51  (Red-coral)
Success:   #2A9D8F  (Teal)
Background:#F7F3EE  (Warm off-white)
Text:      #1D2D2F  (Near-black)
```

### Typography
Use free, web-safe fonts from Google Fonts:
```
Headings: Poppins (600, 700)
Body:     Source Sans 3 (400, 500, 600)
```

### UI Tone
- Friendly, academic, calm
- Rounded cards, soft shadows, clear hierarchy

---

## 2) Infrastructure Assumptions
- Domain and hosting will be provided after development and local testing
- Email service will not be provided; disable outbound email in production until later
- Use local mail catcher (MailHog/Mailpit) for dev and QA

---

## 3) Content & Data (Curated Internally)

### MCQ Set (Initial)
- Target: 150 questions
- Each question includes 4 options, correct answer, explanation, 3 hints
- Topics: vital signs, pharmacology basics, anatomy, safety, clinical procedures

### Terminology Set
- Target: 200 terms with definitions
- Categories: anatomy, conditions, procedures, medications, equipment

### Common Misconceptions
- Target: 20 misconceptions with clarifications

### Sample Users
- 3 Admins, 5 Educators, 30 Students
- 2 demo institutions and 4 demo classes
- Seed demo users/classes during development as needed

---

## 4) Rules We Define Internally

### Authentication & Onboarding
- Admin-created accounts only (internal use)
- Username + password required, email optional
- JWT-based authentication

### Scoring Rules (Baseline)
- Correct answer: +10 points
- Hint usage: -2 points per hint
- Time bonus: +1 to +3 points for quick completion (optional, not used in Rapid-Fire)
- Incorrect answer: 0 points (or -2 in advanced mode)

### Hint System Rules
- Max 3 hints per question
- Hints become progressively specific
- Final hint can reveal partial answer, not full

### Feedback Rules
- Immediate feedback after each question
- Provide explanation and reference if available

### Accessibility Baseline
- WCAG 2.1 AA target
- Keyboard navigation for all interactions
- Contrast ratio >= 4.5:1 for text

---

## 5) Templates in Scope
- Multiple Choice
- Hint-Based Discovery
- Drag and Drop
- Word Cross (Crossword)
- Flashcards (additional)
- Timed Rapid-Fire Quiz (additional)

---

## 6) Timeline Inputs (Internal)
- Week 1: finalize branding + logo + typography
- Week 2: curated content set v1 + scoring rules
- Week 3-4: additional templates and analytics definitions

---

**Last Updated:** 2026-01-06
