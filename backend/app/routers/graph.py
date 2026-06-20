from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import math
from app.database import get_db
from app.seed import WALLETS_SEED, generate_mock_transactions
from app.engines.gnn_predictor import GNNPredictor

router = APIRouter(prefix="/graph", tags=["Blockchain Graph"])

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import math
from app.database import get_db
from app.models.schema import Transaction, Wallet
from app.seed import WALLETS_SEED, generate_mock_transactions
from app.engines.gnn_predictor import GNNPredictor

router = APIRouter(prefix="/graph", tags=["Blockchain Graph"])

@router.get("/")
def get_blockchain_graph(db: Session = Depends(get_db)):
    """
    Returns list of nodes (wallets) and edges (transfers) formatted for React Flow rendering.
    Calculates circular coordinates for layout.
    """
    # Construct graph data using database transactions
    try:
        db_txs = db.query(Transaction).all()
        txs = [
            {
                "from_address": tx.from_address,
                "to_address": tx.to_address,
                "amount_usd": float(tx.amount_usd),
                "token": tx.token,
                "timestamp": tx.timestamp
            } for tx in db_txs
        ]
    except Exception:
        txs = []
        
    if not txs:
        txs = generate_mock_transactions(40)
    
    predictor = GNNPredictor()
    nx_graph, nodes_list = predictor.build_network_graph(txs)
    
    # Calculate GNN predictions for additional detail
    gnn_outputs = predictor.train_and_predict(txs)
    node_preds = gnn_outputs.get("predictions", {})

    # Generate Node coordinates in circular layouts
    nodes = []
    center_x, center_y = 500, 400
    radius = 320
    num_nodes = len(nodes_list)

    # Dictionary map to cross-reference labels
    try:
        db_wallets = db.query(Wallet).all()
        wallet_label_map = {w.address: w.label for w in db_wallets}
        wallet_score_map = {w.address: w.whale_score for w in db_wallets}
        wallet_balance_map = {w.address: float(w.balance_usd) for w in db_wallets}
    except Exception:
        wallet_label_map = {w["address"]: w["label"] for w in WALLETS_SEED}
        wallet_score_map = {w["address"]: w["whale_score"] for w in WALLETS_SEED}
        wallet_balance_map = {w["address"]: w["balance_usd"] for w in WALLETS_SEED}

    for idx, address in enumerate(nodes_list):
        angle = (2 * math.pi * idx) / max(1, num_nodes)
        x = center_x + radius * math.cos(angle)
        y = center_y + radius * math.sin(angle)
        
        label = wallet_label_map.get(address) or wallet_label_map.get(address.lower()) or f"Address: {address[:6]}...{address[-4:]}"
        score = wallet_score_map.get(address) or wallet_score_map.get(address.lower()) or 65
        balance = wallet_balance_map.get(address) or wallet_balance_map.get(address.lower()) or 500000.0
        
        preds_info = node_preds.get(address) or node_preds.get(address.lower()) or {"prediction": "NEUTRAL", "confidence": 0.5}

        nodes.append({
            "id": address,
            "type": "customNode",
            "position": {"x": int(x), "y": int(y)},
            "data": {
                "address": address,
                "label": label,
                "whale_score": score,
                "balance_usd": balance,
                "prediction": preds_info["prediction"],
                "confidence": preds_info["confidence"]
            }
        })

    # Generate Edges
    edges = []
    edge_idx = 0
    for u, v, data in nx_graph.edges(data=True):
        val = data.get("weight", 0.0)
        cnt = data.get("tx_count", 1)
        
        # Animate heavy transaction flow edges (> $2M)
        is_animated = val > 2000000.0
        
        edges.append({
            "id": f"e-{edge_idx}",
            "source": u,
            "target": v,
            "animated": is_animated,
            "label": f"${val/1e6:.1f}M ({cnt} txs)",
            "style": {"stroke": "var(--primary)" if is_animated else "#4A5568", "strokeWidth": 2 if is_animated else 1},
            "data": {
                "amount_usd": val
            }
        })
        edge_idx += 1

    return {
        "nodes": nodes,
        "edges": edges,
        "summary": {
            "node_count": len(nodes),
            "edge_count": len(edges),
            "heavy_transfers_count": sum(1 for e in edges if e["animated"])
        }
    }

