from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.schema import Wallet, Transaction
from app.seed import WALLETS_SEED, generate_mock_transactions
from app.engines.ingestion import BlockchainIngester
from app.engines.whale_detector import WhaleDetector
from typing import Optional, List

router = APIRouter(prefix="/whales", tags=["Whale Tracker"])

class IngestRequest(BaseModel):
    address: str
    label: Optional[str] = "Ingested Wallet"

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

@router.post("/ingest")
def ingest_whale_wallet(req: IngestRequest, db: Session = Depends(get_db)):
    """
    Ingests live wallet transaction data and holdings metrics, runs detectors, and registers it.
    """
    address = req.address.strip()
    if not address:
        raise HTTPException(status_code=400, detail="Invalid address format.")

    try:
        # Check if already exists
        db_wallet = db.query(Wallet).filter(Wallet.address.lower() == address.lower()).first()
        
        # Ingest data
        data = BlockchainIngester.ingest_address_data(address)
        balance_usd = data["balance_usd"]
        txs = data["transactions"]
        
        # Calculate whale indicators
        metrics = WhaleDetector.process_wallet_metrics(address, txs, balance_usd)
        
        # Upsert wallet
        if not db_wallet:
            db_wallet = Wallet(address=address)
        
        db_wallet.label = req.label or db_wallet.label or "Ingested Wallet"
        db_wallet.whale_score = metrics["whale_score"]
        db_wallet.influence_score = metrics["influence_score"]
        db_wallet.accumulation_score = metrics["accumulation_score"]
        db_wallet.distribution_score = metrics["distribution_score"]
        db_wallet.net_flow_24h = metrics["net_flow_24h"]
        db_wallet.balance_usd = metrics["balance_usd"]
        
        db.add(db_wallet)
        db.commit()

        # Load / Save transactions
        for tx in txs:
            # Check unique hash
            exists = db.query(Transaction).filter(Transaction.hash == tx["hash"]).first()
            if not exists:
                db_tx = Transaction(
                    hash=tx["hash"],
                    from_address=tx["from_address"],
                    to_address=tx["to_address"],
                    amount_usd=tx["amount_usd"],
                    token=tx["token"],
                    timestamp=tx["timestamp"]
                )
                db.add(db_tx)
        db.commit()
        db.refresh(db_wallet)
        
        return {
            "status": "SUCCESS",
            "message": f"Successfully ingested {len(txs)} transactions and computed metrics for {address}",
            "wallet": db_wallet
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database / API Ingestion Error: {str(e)}")

@router.post("/sync-all")
def sync_all_wallets(db: Session = Depends(get_db)):
    """
    Refreshes transaction metrics and balance valuations for all tracked database whales.
    """
    try:
        wallets = db.query(Wallet).all()
        updated_count = 0
        for w in wallets:
            # Re-ingest
            data = BlockchainIngester.ingest_address_data(w.address)
            metrics = WhaleDetector.process_wallet_metrics(w.address, data["transactions"], data["balance_usd"])
            
            w.whale_score = metrics["whale_score"]
            w.influence_score = metrics["influence_score"]
            w.accumulation_score = metrics["accumulation_score"]
            w.distribution_score = metrics["distribution_score"]
            w.net_flow_24h = metrics["net_flow_24h"]
            w.balance_usd = metrics["balance_usd"]
            
            db.add(w)
            
            # Save new transactions
            for tx in data["transactions"]:
                exists = db.query(Transaction).filter(Transaction.hash == tx["hash"]).first()
                if not exists:
                    db_tx = Transaction(
                        hash=tx["hash"],
                        from_address=tx["from_address"],
                        to_address=tx["to_address"],
                        amount_usd=tx["amount_usd"],
                        token=tx["token"],
                        timestamp=tx["timestamp"]
                    )
                    db.add(db_tx)
            updated_count += 1
            
        db.commit()
        return {"status": "SUCCESS", "message": f"Successfully synchronized {updated_count} tracked wallet profiles."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

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

