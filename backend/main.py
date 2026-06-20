import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database and Model Imports
from app.database import engine, Base, SessionLocal
from app.models.schema import Wallet, Transaction, Signal, Prediction, Backtest, Alert
from app.seed import (
    WALLETS_SEED,
    generate_mock_transactions,
    generate_mock_signals,
    generate_mock_predictions,
    generate_mock_backtests,
    generate_mock_alerts
)

# Router Imports
from app.routers import overview, tracker, graph, gnn, backtest

# Initialize database tables on startup
Base.metadata.create_all(bind=engine)

# Database Auto-Seeder
db = SessionLocal()
try:
    if db.query(Wallet).count() == 0:
        print("WhaleMind DB is empty. Initializing automatic seeder...")
        
        # 1. Seed wallets
        for w in WALLETS_SEED:
            db_w = Wallet(**w)
            db.add(db_w)
        db.commit()
        
        # 2. Seed transactions
        txs = generate_mock_transactions(50)
        for tx in txs:
            db_tx = Transaction(**tx)
            db.add(db_tx)
        db.commit()

        # 3. Seed signals
        sigs = generate_mock_signals()
        for sig in sigs:
            db_sig = Signal(**sig)
            db.add(db_sig)
        db.commit()

        # 4. Seed GNN predictions
        preds = generate_mock_predictions()
        for pred in preds:
            db_pred = Prediction(**pred)
            db.add(db_pred)
        db.commit()

        # 5. Seed backtests
        bts = generate_mock_backtests()
        for bt in bts:
            db_bt = Backtest(**bt)
            db.add(db_bt)
        db.commit()

        # 6. Seed system alerts
        als = generate_mock_alerts()
        for al in als:
            db_al = Alert(**al)
            db.add(db_al)
        db.commit()
        
        print("Auto-seeding successfully completed!")
except Exception as e:
    print(f"Error seeding database: {e}")
    db.rollback()
finally:
    db.close()

# Initialize FastAPI App instance
app = FastAPI(
    title="WhaleMind AI API",
    description="Institutional-grade crypto blockchain data intelligence and Graph Neural Networks predictions engine.",
    version="1.0.0"
)

# CORS Policy Configs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow development frontend connectivity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Routers
app.include_router(overview.router, prefix="/api")
app.include_router(tracker.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(gnn.router, prefix="/api")
app.include_router(backtest.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "service": "WhaleMind AI Intelligence Engine API",
        "version": "1.0.0",
        "database": os.getenv("DATABASE_URL", "sqlite:///./whalemind.db").split(":")[0]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
