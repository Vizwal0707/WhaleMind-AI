from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.schema import Wallet, Transaction
from app.seed import WALLETS_SEED, generate_mock_transactions
from typing import Optional

router = APIRouter(prefix="/whales", tags=["Whale Tracker"])

@router.get("/")
def get_whales_list(
    db: Session = Depends(get_db),
    min_whale_score: int = Query(0, ge=0, le=100),
    sort_by: str = Query("whale_score", enum=["whale_score", "balance_usd", "net_flow_24h"])
):
    """
    Returns lists of active crypto whales sorted and filtered by score metrics.
    """
    try:
        query = db.query(Wallet).filter(Wallet.whale_score >= min_whale_score)
        if sort_by == "whale_score":
            query = query.order_by(Wallet.whale_score.desc())
        elif sort_by == "balance_usd":
            query = query.order_by(Wallet.balance_usd.desc())
        elif sort_by == "net_flow_24h":
            query = query.order_by(Wallet.net_flow_24h.desc())
            
        wallets = query.all()
        if not wallets:
            wallets = WALLETS_SEED
    except Exception:
        wallets = WALLETS_SEED
        
    return wallets

@router.get("/{address}")
def get_whale_details(address: str, db: Session = Depends(get_db)):
    """
    Returns detailed parameters and specific transaction logs for a single wallet.
    """
    wallet = None
    try:
        wallet = db.query(Wallet).filter(Wallet.address == address).first()
    except Exception:
        pass
        
    if not wallet:
        # Check in seed data
        for w in WALLETS_SEED:
            if w["address"].lower() == address.lower():
                wallet = w
                break
                
    # Fallback default if not found
    if not wallet:
        wallet = {
            "address": address,
            "label": "Unknown Institution",
            "whale_score": 75,
            "influence_score": 68,
            "accumulation_score": 50,
            "distribution_score": 50,
            "net_flow_24h": 0.0,
            "balance_usd": 15000000.0
        }
        
    # Get transactions
    try:
        txs = db.query(Transaction).filter(
            (Transaction.from_address == address) | (Transaction.to_address == address)
        ).order_by(Transaction.timestamp.desc()).all()
        if not txs:
            txs = [tx for tx in generate_mock_transactions(15) if tx["from_address"] == address or tx["to_address"] == address]
    except Exception:
        txs = [tx for tx in generate_mock_transactions(15) if tx["from_address"] == address or tx["to_address"] == address]
        
    return {
        "wallet_details": wallet,
        "recent_transactions": txs
    }
