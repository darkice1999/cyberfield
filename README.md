# Spot the Phish — expanded learning edition

A React cybersecurity training app with detailed notes, fictional evidence-based games and sourced real-world history.

## Included

- Game: 20 Easy, 40 Hard and 80 Very Hard scenarios. Each has its own ID, subject, message and context across the complete bank. Attempts shuffle each level without replacement.
- Saved answers and position, explanations after every answer, and a completed-level mistake review. Explicit replay resets the level and reshuffles the same questions.
- Page-based experience: Home, Learn, Practice, War Room, History and Progress each have a dedicated view and clear navigation.
- Learn: 12 topics, 36 explained subtopics, 108 examples, practical actions for every topic, search, topic navigation and reading progress.
- History: Nigerian/Nigeria-linked cases, older worldwide incidents, and selected 2025 international events with dates, impact, lessons, discussion prompts and source links.
- War Room now has 1,600 defender missions: 200 in each of eight categories. Each category includes 40 Guided, 80 Investigative and 80 Strategic missions, with search and pagination.
- The original short quiz and optional AI interfaces remain. The new Game, Learn and War Room content need no AI connection.

## Run

Use Node.js compatible with Vite 8 (see its package engine requirement) and npm.

    npm ci
    npm run dev

Open the local address printed by the server. A ready-built copy is included in dist. Serve that directory with a static web server rather than opening its HTML using a file URL.

    npm run build
    npm run preview

## Checks

    npm test
    npm run lint
    npm run build

Tests cover the exact counts, globally unique content fields, complete shuffled attempts, no double answers or unanswered skips, saved-state validation, blocked-storage fallback and the learning/history inventory.

## Content and source files

- src/question-bank.js: 140 hand-authored game scenarios. Addresses use reserved .example domains and render as text. Context provides evidence for the binary answer; in real situations, insufficient evidence should lead to verification.
- src/learning-content.js: original notes, examples, further reading and sourced history.
- src/App.jsx and src/cyber.css: the new page-by-page app, learning library, practical activities, history timeline and responsive layouts.
- src/TrainingGame.jsx and src/training-state.js: game progression, review, scoring and browser persistence.
- src/war-room-data.js: defender-only War Room missions and their three-level difficulty progression.
- src/spot-the-phish.jsx: navigation and retained original modes.

Update BANK_VERSION in src/training-state.js when making incompatible bank changes so old attempts do not silently use new answers.

## Storage and limits

Progress belongs to this browser and origin; it does not sync across devices. Clearing site data removes it. If saving fails, the app remains usable during the current visit and explains the limitation. Reading checkmarks are self-reported, not proof of mastery. Replaying a completed level intentionally repeats its bank; unlimited never-before-seen questions are not promised.

The inherited AI integration has no authenticated server backend and is NOT operational as supplied. Failed AI requests now show an unavailable/retry state instead of an empty or scoreable error scenario. Connecting AI requires a server-side integration with private credentials, response validation and appropriate usage controls. Never embed service credentials in client code. AI-generated questions are separate from the reviewed bank and are not guaranteed unique.

The retained War Room and short quiz are separate from the expanded Game bank. This edition is not a complete subject-matter audit of their original content.

External references and optional hosted fonts need internet access. History separates documented facts from educational interpretation. The package excludes installed dependencies; npm ci restores them using the included lockfile.
