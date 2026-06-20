import numpy as np
from typing import Dict, List, Any

class WhaleDetector:
    @staticmethod
    def calculate_whale_score(balance_usd: float, tx_volume_24h: float) -> int:
        """
        Combines absolute holdings and active volume to calculate a Whale Score between 0 and 100.
        """
        # Thresholds (e.g., $10M holdings = score 90, $1M active volume = score 90)
        h_score = min(100, int(np.log10(max(1.0, balance_usd)) * 10)) if balance_usd > 1000 else 0
        v_score = min(100, int(np.log10(max(1.0, tx_volume_24h)) * 12)) if tx_volume_24h > 1000 else 0
        
        # Weighted average: 70% holdings, 30% volume
        score = int(0.7 * h_score + 0.3 * v_score)
        return max(0, min(100, score))

    @staticmethod
    def calculate_influence_score(tx_count: int, unique_interactors: int) -> int:
        """
        Calculates Influence Score based on network degree (connections) on-chain.
        """
        if tx_count == 0:
            return 0
        
        # Scale logarithmically
        conn_factor = min(50, int(np.log2(max(1, unique_interactors)) * 8))
        vol_factor = min(50, int(np.log10(max(1, tx_count)) * 15))
        
        return min(100, conn_factor + vol_factor)

    @staticmethod
    def calculate_accumulation_distribution(incoming_usd: float, outgoing_usd: float) -> Dict[str, int]:
        """
        Calculates Accumulation and Distribution scores based on net asset flow.
        """
        total_flow = incoming_usd + outgoing_usd
        if total_flow == 0:
            return {"accumulation": 50, "distribution": 50}
        
        net_ratio = (incoming_usd - outgoing_usd) / total_flow
        
        # Maps ratio [-1, 1] to scores [0, 100]
        accum = int(50 + (net_ratio * 50))
        dist = 100 - accum
        
        return {
            "accumulation": max(0, min(100, accum)),
            "distribution": max(0, min(100, dist))
        }

    @classmethod
    def process_wallet_metrics(cls, address: str, txs: List[Dict[str, Any]], balance_usd: float) -> Dict[str, Any]:
        """
        Ingests transactions for a wallet and returns detailed whale analytics.
        """
        incoming = 0.0
        outgoing = 0.0
        unique_counterparts = set()
        
        for tx in txs:
            amt = float(tx.get("amount_usd", 0.0))
            if tx.get("from_address") == address:
                outgoing += amt
                unique_counterparts.add(tx.get("to_address"))
            elif tx.get("to_address") == address:
                incoming += amt
                unique_counterparts.add(tx.get("from_address"))
                
        net_flow = incoming - outgoing
        tx_count = len(txs)
        
        whale_score = cls.calculate_whale_score(balance_usd, incoming + outgoing)
        influence = cls.calculate_influence_score(tx_count, len(unique_counterparts))
        acc_dist = cls.calculate_accumulation_distribution(incoming, outgoing)
        
        return {
            "address": address,
            "whale_score": whale_score,
            "influence_score": influence,
            "accumulation_score": acc_dist["accumulation"],
            "distribution_score": acc_dist["distribution"],
            "net_flow_24h": net_flow,
            "balance_usd": balance_usd
        }
