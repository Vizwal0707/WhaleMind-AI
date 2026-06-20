from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.schema import Wallet, Signal, Prediction
from app.seed import WALLETS_SEED
import random

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("/")
def get_overview_dashboard(db: Session = Depends(get_db)):
    """
    Returns market status, global KPI metrics, and asset pricing chart details.
    """
    # Fetch from SQLite/Postgres or fallback to seed defaults
    try:
        whale_count = db.query(Wallet).count()
        if whale_count == 0:
            whale_count = len(WALLETS_SEED)
    except Exception:
        whale_count = len(WALLETS_SEED)
        
    # Mock some dynamic prices
    btc_price = 68450.0 + random.uniform(-150.0, 150.0)
    eth_price = 3780.0 + random.uniform(-10.0, 10.0)
    
    # Portfolio performance history (simulated data)
    performance_chart = [
        {"timestamp": "2026-06-15", "portfolio_value": 1000000.0, "btc_value": 1000000.0},
        {"timestamp": "2026-06-16", "portfolio_value": 1025000.0, "btc_value": 1012000.0},
        {"timestamp": "2026-06-17", "portfolio_value": 1058000.0, "btc_value": 998000.0},
        {"timestamp": "2026-06-18", "portfolio_value": 1042000.0, "btc_value": 1004000.0},
        {"timestamp": "2026-06-19", "portfolio_value": 1095000.0, "btc_value": 1032000.0},
        {"timestamp": "2026-06-20", "portfolio_value": 1124000.0, "btc_value": 1045000.0}
    ]

    return {
        "market_stats": {
            "btc_price": round(btc_price, 2),
            "eth_price": round(eth_price, 2),
            "market_cap_usd": 2.45e12,
            "whale_count": whale_count,
            "active_signals": 14,
            "model_prediction_sentiment": "BULLISH",
            "model_confidence": 0.81
        },
        "prices_chart": [
            {"day": "Mon", "BTC": 67800, "ETH": 3650},
            {"day": "Tue", "BTC": 68200, "ETH": 3710},
            {"day": "Wed", "BTC": 67900, "ETH": 3690},
            {"day": "Thu", "BTC": 68900, "ETH": 3740},
            {"day": "Fri", "BTC": 69100, "ETH": 3810},
            {"day": "Sat", "BTC": btc_price, "ETH": eth_price}
        ],
        "portfolio_performance": performance_chart
    }
