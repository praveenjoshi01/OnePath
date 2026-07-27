# AGENTS.md - Instructions & Guidelines for AI Coding Agents 🤖

This file contains binding instructions and behavioral directives for all AI coding assistants (including Antigravity, Claude, Copilot, Cursor, etc.) working in this repository.

---

## 🚨 MANDATORY DIRECTIVE: Documentation Update on Git Commit / Push

> [!IMPORTANT]
> **CRITICAL RULE FOR ALL AI AGENTS:**
> Whenever you modify code, add new features, adjust database schemas, or update API routes in this codebase, **YOU MUST ALWAYS UPDATE `ARCHITECTURE.MD` AND `README.MD` BEFORE PERFORMING A `git commit` OR `git push`.**

### Required Workflow for Code Changes & Commits:

1. **Implement Code Changes**:
   - Write or update code files in `client/` or `server/`.
   - Verify that your code builds cleanly (`npm run build` in `client/`).

2. **Update `README.MD`**:
   - Add any new features, configuration changes, environment variables, dependencies, or API route changes.
   - Keep quick-start commands and usage instructions accurate.

3. **Update `ARCHITECTURE.MD`**:
   - Update the System Architecture diagram (Mermaid) if component relationships change.
   - Update Database ER diagrams or SQLite table definitions if schemas are modified.
   - Document any new data flows, room classification logic, or API handoff payload changes.

4. **Stage & Commit Together**:
   - Ensure `README.md` and `ARCHITECTURE.md` are included in the same git commit as your code changes:
     ```bash
     git add .
     git commit -m "feat: [describe feature] (updated README.md and ARCHITECTURE.md)"
     git push origin main
     ```

---

## 🏗️ Codebase Architecture & Structure Rules

- **Workspace Path**: Main application resides in the `Code/` directory.
- **Backend Architecture (`server/`)**:
  - Express REST API routes must be placed in `server/routes/`.
  - Database logic and SQLite schema initialization reside in `server/db.js`.
  - Keep foreign key constraints enabled on SQLite connection (`db.pragma('foreign_keys = ON')`).
- **Frontend Architecture (`client/`)**:
  - React components reside in `client/src/components/`.
  - Global styles, design tokens, and glassmorphism styling are maintained in `client/src/index.css`.
  - Vite API proxy is configured in `client/vite.config.js` (`/api` -> `http://localhost:3001`).

---

## 🧪 Verification Protocol Before Push

Before pushing code changes:
1. **Frontend Build Check**:
   ```bash
   cd client && npm run build
   ```
   Ensure 0 bundling or syntax errors.

2. **Backend API Verification**:
   Test server health endpoint `http://localhost:3001/api/health` and verify SQLite query execution.

3. **Documentation Sync Check**:
   Confirm that both `README.md` and `ARCHITECTURE.md` are staged and committed alongside code modifications.
