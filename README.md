# DATA SCIENCE DIGITAL LIBRARY PORTAL

An academic, interactive, and modern web application developed for **CHOWDA ANAND** at **MOHAN BABU UNIVERSITY** (CSE - Data Science, 3rd Year).

---

## 🌟 Key Features

1. **Midnight Indigo Theme & Design System**:
   - Modern dark UI palette with curated indigo (`#6366F1`), purple (`#A78BFA`), elevated midnight card surfaces (`#1B2440`, `#222D4B`), and crisp typography.
   - Animated Aurora radial background with low-overhead GPU transform keyframes.
   - Distinctive welcome banner with dynamic gradient border and personalized greeting.
   - Card hover lift (3–5px) with restrained indigo glow effects.
   - Comprehensive `@media (prefers-reduced-motion: reduce)` accessibility support.

2. **Application Shell & Navigation**:
   - Modern Top Navigation Bar with active indicator, mobile drawer toggle, live WebAssembly runtime status dot, and student avatar.
   - 9 Primary Interactive Sections:
     1. **Overview / Home**: Academic hero banner, student ID card, live progress metrics, and curriculum progress ledger.
     2. **Modules**: Structured curriculum modules with interactive reader modal and downloadable study notes.
     3. **Lab Practice**: 10 prescribed experiments (DS01–DS10) with interactive code editor, real-time Python execution, and artifact upload.
     4. **CSV Studio**: Interactive EDA dataset analyzer with missing-value audit, duplicate detection, tabular preview, and automated column distribution plots.
     5. **Resources**: Academic reference shelf, textbooks, cheat sheets, and downloadable sample datasets.
     6. **Tools**: 10 technology cards (Python, NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn, Jupyter, SQL, Colab, GitHub) with documentation links.
     7. **Live Code (Sandbox)**: Unrestricted Python 3.12 playground with pre-built templates, real execution, inline Matplotlib rendering, and external compiler links.
     8. **AI Assistant**: Data Science study copilot with suggested technical topic chips, formula explanations, and Python code guidance.
     9. **Profile**: Verified academic credentials for Chowda Anand (Mohan Babu University), photo upload, editable profile modal, and social links.

3. **10 Prescribed Data Science Experiments (DS01 to DS10)**:
   - **DS01**: Python Basics and Data Types
   - **DS02**: NumPy Array Operations
   - **DS03**: Pandas DataFrame Operations
   - **DS04**: Data Cleaning and Missing Values
   - **DS05**: Exploratory Data Analysis
   - **DS06**: Data Visualization with Matplotlib
   - **DS07**: Statistical Analysis
   - **DS08**: Correlation Analysis
   - **DS09**: Linear Regression
   - **DS10**: Classification Model Evaluation

4. **Real In-Browser Python Execution (Pyodide Wasm)**:
   - Genuine execution using **Pyodide Python 3.12** inside the browser.
   - Real-time stdout/stderr capture and accurate millisecond execution timers.
   - Pre-loaded scientific stack: `numpy`, `pandas`, `matplotlib`.
   - Direct inline Matplotlib plot canvas rendering into the workspace!
   - Dual-mode fallback: seamless execution via local server subprocess (`/api/execute`) if offline.

5. **Experiment Search & Filtering**:
   - Code input with instant matching (typing `DS01` opens Python Basics).
   - Case-insensitive search and title/keyword filtering.
   - Explicit invalid-code feedback (e.g. searching `DS99` shows a clear warning and does not open arbitrary experiments).
   - Status filters: `All`, `Completed`, `Running`, `Not Started`, `Failed`.

6. **Experiment Output Upload & Storage**:
   - Upload outputs associated with each experiment (PNG, JPG, CSV, TXT, PDF, SVG).
   - Validation for file extensions and 10MB size limits.
   - Modal viewer with inline image/text previews and one-click downloads.

7. **Tools Library (10 Cards)**:
   - Python, NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn, Jupyter Notebook, SQL, Google Colab, and GitHub.
   - Real official documentation links and clickable experiment code tags.

8. **Student Profile**:
   - Initialized with confirmed academic data:
     - Student Name: **CHOWDA ANAND**
     - College: **MOHAN BABU UNIVERSITY**
     - Branch: **CSE - Data Science**
     - Academic Year: **3rd Year**
   - Editable fields: Roll Number, Email, Section, GitHub URL, LinkedIn URL, Skills.
   - Personal photograph upload, preview, and backend storage.

9. **Dual-Mode Backend & Database**:
   - **Local Mode (Active)**: Python HTTP server with embedded SQLite (`student.db`), zero dependencies.
   - **Cloud Mode (Ready)**: Full Supabase schema (`supabase_schema.sql`) with PostgreSQL tables, Row Level Security (RLS) policies, and storage setup.

---

## 🚀 How to Run Locally

### Option 1: Double-Click Batch File (Windows)
Double-click [run_portal.bat](file:///c:/Users/chowd/Desktop/Ds_project/run_portal.bat) in the project folder. It will launch the Python server and open `http://127.0.0.1:8000` in your default browser.

### Option 2: Command Line
Open a terminal (PowerShell or Command Prompt) in the project directory:
```bash
python server.py 8000
```
Then navigate to `http://127.0.0.1:8000` in your browser.

---

## 📁 Project File Structure

- `index.html`: Main application shell with 9 interactive sections (Home, Modules, Labs, CSV Studio, Resources, Tools, Sandbox, AI Assistant, Profile) and accessible modal dialogs.
- `styles.css`: Complete Midnight Indigo design system, Aurora keyframe animations, responsive tables, code panels, and chat UI.
- `app.js`: Application controller, Pyodide Python 3.12 WebAssembly runtime manager, CSV dataset analyzer, interactive playground, and AI study copilot.
- `server.py`: Python HTTP server and REST API (`/api/profile`, `/api/experiments`, `/api/stats`, `/api/tools`, `/api/runs`, `/api/upload_output`, `/api/execute`).
- `database.py`: SQLite database manager with initial curriculum data (DS01–DS10) and student profile.
- `student.db`: SQLite database file storing persistent records.
- `supabase_client.js`: Frontend client enabling dual-mode connection to Supabase or local API.
- `supabase_schema.sql`: Production PostgreSQL schema and Row Level Security (RLS) policies for Supabase.
- `SUPABASE_SETUP.md`: Guide for connecting Supabase environment variables and storage buckets.
- `assets/`: Static project assets (student photograph, plot templates).
- `uploads/`: Secure local storage directory for uploaded student outputs and profile photographs.
