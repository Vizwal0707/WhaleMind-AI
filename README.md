# WhaleMind AI — Crypto Intelligence Platform

WhaleMind AI is a portfolio-grade, institutional crypto intelligence dashboard modeled after industry leaders like Nansen, Arkham, and Chainalysis. It maps on-chain transaction flows, structures active wallet graph networks, trains Graph Neural Networks (GNNs) in PyTorch to forecast price biases, ranks alpha indicators, and executes strategy backtests.

---

## Key Core Modules

1.  **Whale Detection Engine:** Parses transaction lines and calculates holdings indices, Net Flow volumes, Influence metrics, and Accumulation/Distribution states.
2.  **Graph Neural Networks (GNNs):** Models transaction transfers as directed graphs. Extracts topological node parameters via NetworkX. Runs predictions using GCN (Graph Convolutional Networks), GraphSAGE, and GAT (Graph Attention Networks) models in PyTorch.
3.  **Alpha Factors Library:** Generates indicator signals, ranks features by predictive importance, and maps correlation matrices.
4.  **Backtester Terminal:** Backtests trading strategies (Whale Following, GNN Prediction, Combined Alpha) and measures Sharpe, Sortino, CAGR, and Drawdowns against Buy-and-Hold HODL baseline vectors.
5.  **Interactive Visualizations:** Structures wallet layouts in React Flow viewports and draws metrics charts using Recharts.

---

## Technology Stack

*   **Frontend:** Next.js 15 (React 19, TypeScript, Tailwind CSS, Recharts, React Flow, Framer Motion)
*   **Backend:** FastAPI (Python, Uvicorn, SQLAlchemy ORM, Pydantic)
*   **AI/ML:** PyTorch, NetworkX, NumPy, Pandas, Scikit-Learn, XGBoost
*   **Database:** PostgreSQL (Relation schema tables) & Redis (Cache)
*   **Deployment:** Docker, Docker Compose

---

## Directory Structure

```
WhaleMind-AI/
├── docker-compose.yml
├── README.md
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Master shell router switcher
│       │   └── layout.tsx
│       ├── components/
│       │   ├── Sidebar.tsx       # Navigation panels
│       │   ├── StatCard.tsx      # KPI cards
│       │   └── *Tab.tsx          # Page tab modules (1 to 8)
│       └── lib/
│           └── api.ts            # Query adapter with local fallback mocks
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   └── app/
│       ├── database.py           # SQL connections
│       ├── seed.py               # Auto-seeder database entries
│       ├── models/
│       │   └── schema.py         # SQLAlchemy schemas
│       ├── engines/
│       │   ├── whale_detector.py # Holdings & score engines
│       │   ├── gnn_predictor.py  # PyTorch & NetworkX pipelines
│       │   ├── alpha_generator.py# ML Factor correlation engines
│       │   └── backtester.py     # Backtesting simulators
│       └── routers/
│           └── *.py              # FastAPI endpoints
└── database/
    └── init.sql                  # PostgreSQL schemas definitions
```

---

## Setup & Running Instructions

### Option 1: Multi-Container Deployment (Recommended)

To spin up all services (Next.js, FastAPI, PostgreSQL, Redis) with a single command:

1.  Make sure Docker Desktop is open and running on your system.
2.  Navigate to the root directory and build/start the containers:
    ```bash
    docker compose up --build
    ```
3.  Open your browser and navigate to:
    *   **Frontend Dashboard:** `http://localhost:3000`
    *   **FastAPI API Docs:** `http://localhost:8000/docs`

---

### Option 2: Standalone Local Runs (Zero-Dependency Developer Setup)

You can run both services locally without Docker. The system automatically configures a local SQLite file (`whalemind.db`) and activates local mock fallbacks on the frontend if the backend API is disconnected, allowing complete offline execution.

#### Step A: Run Backend API
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the FastAPI application:
    ```bash
    python main.py
    ```
    The server will startup on `http://localhost:8000`.

#### Step B: Run Frontend Dashboard
1.  Open a new terminal window and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Launch the development server:
    ```bash
    npm run dev
    ```
    Open **`http://localhost:3000`** in your browser!
