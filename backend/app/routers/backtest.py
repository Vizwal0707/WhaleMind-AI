from fastapi import APIRouter, Query
from app.engines.backtester import Backtester
from app.engines.alpha_generator import AlphaGenerator
from app.seed import generate_mock_alerts, WALLETS_SEED, generate_mock_transactions
import random

router = APIRouter(prefix="/backtest", tags=["Backtester & Signals"])

@router.get("/run")
def run_backtests(strategy: str = Query("Combined Alpha Strategy", enum=["Whale Following", "GNN Prediction Strategy", "Combined Alpha Strategy"])):
    """
    Executes backtester on the selected strategy and returns Sharpe metrics, cagr, and equity histories.
    """
    res = Backtester.run_strategy_backtest(strategy)
    return res

@router.get("/alpha")
def get_alpha_factors():
    """
    Returns lists of generated alpha factors, relative predictive weights, and correlation matrix.
    """
    txs = generate_mock_transactions(30)
    factors = AlphaGenerator.calculate_alpha_factors(WALLETS_SEED, txs)
    corr = AlphaGenerator.get_correlation_matrix()
    
    return {
        "alpha_factors": factors,
        "correlation_analysis": corr,
        "feature_importance": [
            {"factor": "Whale Accumulation", "importance": 94},
            {"factor": "Exchange Outflows", "importance": 85},
            {"factor": "Network growth Rate", "importance": 72},
            {"factor": "Active Wallets", "importance": 65},
            {"factor": "Funding Rates", "importance": 48}
        ]
    }

@router.get("/signals")
def get_trading_signals():
    """
    Returns active buy, sell, or hold recommendations for major cryptocurrencies.
    """
    return [
        {"coin": "BTC", "signal": "BUY", "confidence": 0.84, "entry": 67800.0, "target": 74000.0, "stop_loss": 65200.0},
        {"coin": "ETH", "signal": "SELL", "confidence": 0.69, "entry": 3780.0, "target": 3450.0, "stop_loss": 3950.0},
        {"coin": "SOL", "signal": "BUY", "confidence": 0.72, "entry": 142.0, "target": 165.0, "stop_loss": 131.0},
        {"coin": "LINK", "signal": "BUY", "confidence": 0.78, "entry": 15.4, "target": 19.0, "stop_loss": 14.1},
        {"coin": "UNI", "signal": "HOLD", "confidence": 0.52, "entry": 7.8, "target": 9.2, "stop_loss": 7.1}
    ]

@router.get("/alerts")
def get_system_alerts():
    """
    Returns lists of high-value whale transactions and prediction warnings.
    """
    alerts = generate_mock_alerts()
    return alerts
