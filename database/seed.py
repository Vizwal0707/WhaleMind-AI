import random
from datetime import datetime, timedelta

# List of real-looking Whale wallets and names
WALLETS_SEED = [
    {"address": "0x1F9090aaE28b8a3dCdf852A7412215ad1d1D507A", "label": "Jump Crypto", "whale_score": 98, "influence_score": 95, "accumulation_score": 85, "distribution_score": 15, "net_flow_24h": 4500000.0, "balance_usd": 125000000.0},
    {"address": "0x8C6B2F8bA24A6eE031a0e5b768eA2f7a911aE322", "label": "Amber Group", "whale_score": 95, "influence_score": 92, "accumulation_score": 75, "distribution_score": 25, "net_flow_24h": -1200000.0, "balance_usd": 89000000.0},
    {"address": "0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045", "label": "vitalik.eth", "whale_score": 99, "influence_score": 99, "accumulation_score": 30, "distribution_score": 10, "net_flow_24h": -45000.0, "balance_usd": 380000000.0},
    {"address": "0x28C6c06298d514Db089934071355E5743bf21d60", "label": "Binance 14 (Cold Wallet)", "whale_score": 100, "influence_score": 98, "accumulation_score": 90, "distribution_score": 5, "net_flow_24h": 12500000.0, "balance_usd": 1250000000.0},
    {"address": "0xF977814e90dA44bFA03b6295A0616a897441aceC", "label": "Binance 8 (Hot Wallet)", "whale_score": 97, "influence_score": 94, "accumulation_score": 40, "distribution_score": 60, "net_flow_24h": -8200000.0, "balance_usd": 340000000.0},
    {"address": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", "label": "PulseChain: Sacrifice", "whale_score": 92, "influence_score": 85, "accumulation_score": 95, "distribution_score": 0, "net_flow_24h": 0.0, "balance_usd": 180000000.0},
    {"address": "0x53d614A564614989D17A3598D3457D7Cb3c81B60", "label": "Wintermute Whale", "whale_score": 94, "influence_score": 91, "accumulation_score": 60, "distribution_score": 40, "net_flow_24h": 320000.0, "balance_usd": 74000000.0},
    {"address": "0xE853B3C84b2c1C68bE1D3111f32a76f2d22Fad20", "label": "FalconX Collector", "whale_score": 88, "influence_score": 80, "accumulation_score": 80, "distribution_score": 20, "net_flow_24h": 1800000.0, "balance_usd": 42000000.0},
    {"address": "0x77ad3a15b5a7db0f3a152dfd1efddb1c1d1a1b1a", "label": "Multisig Alpha", "whale_score": 85, "influence_score": 78, "accumulation_score": 50, "distribution_score": 50, "net_flow_24h": -300000.0, "balance_usd": 32000000.0},
    {"address": "0xBfE4dAfA2C9d832c3f15F6A974b830d6F2F53a5A", "label": "Early Adopter Wallet", "whale_score": 90, "influence_score": 88, "accumulation_score": 10, "distribution_score": 90, "net_flow_24h": -6800000.0, "balance_usd": 95000000.0}
]

TOKENS = ["ETH", "USDT", "USDC", "WBTC", "LINK"]

def generate_mock_transactions(num_txs=50):
    txs = []
    # Seed wallets addresses list
    addrs = [w["address"] for w in WALLETS_SEED]
    # Add some generic non-whale addresses to represent external transfers
    addrs.extend([
        "0x0000000000000000000000000000000000000000",
        "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe", # MakerDAO
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", # WETH
        "0x3f5ce5fb1b365978a3f8be0f9b699ab9c18ff2ad"  # Arbitrum bridge
    ])
    
    start_time = datetime.now() - timedelta(days=7)
    
    for i in range(num_txs):
        tx_time = start_time + timedelta(minutes=random.randint(1, 10000))
        tx_hash = "0x" + "".join(random.choices("0123456789abcdef", k=64))
        from_a = random.choice(addrs)
        to_a = random.choice(addrs)
        while from_a == to_a:
            to_a = random.choice(addrs)
            
        amount = round(random.uniform(50000.0, 15000000.0), 2)
        token = random.choice(TOKENS)
        
        txs.append({
            "hash": tx_hash,
            "from_address": from_a,
            "to_address": to_a,
            "amount_usd": amount,
            "token": token,
            "timestamp": tx_time
        })
    return txs

def generate_mock_signals():
    return [
        {"factor_name": "Whale Accumulation", "coin": "BTC", "signal_type": "BUY", "predictive_power": 0.88, "correlation": 0.65},
        {"factor_name": "Whale Distribution", "coin": "ETH", "signal_type": "SELL", "predictive_power": 0.85, "correlation": -0.58},
        {"factor_name": "Exchange Inflow Spike", "coin": "BTC", "signal_type": "SELL", "predictive_power": 0.79, "correlation": -0.48},
        {"factor_name": "Exchange Outflow Spike", "coin": "ETH", "signal_type": "BUY", "predictive_power": 0.82, "correlation": 0.52},
        {"factor_name": "Active Wallet Growth", "coin": "BTC", "signal_type": "BUY", "predictive_power": 0.74, "correlation": 0.40},
        {"factor_name": "Network Growth Rate", "coin": "ETH", "signal_type": "BUY", "predictive_power": 0.76, "correlation": 0.45}
    ]

def generate_mock_predictions():
    return [
        {"coin": "BTC", "time_horizon": "1h", "prediction": "BULLISH", "confidence": 0.84},
        {"coin": "BTC", "time_horizon": "4h", "prediction": "BULLISH", "confidence": 0.79},
        {"coin": "BTC", "time_horizon": "24h", "prediction": "BULLISH", "confidence": 0.72},
        {"coin": "ETH", "time_horizon": "1h", "prediction": "NEUTRAL", "confidence": 0.58},
        {"coin": "ETH", "time_horizon": "4h", "prediction": "BEARISH", "confidence": 0.65},
        {"coin": "ETH", "time_horizon": "24h", "prediction": "BEARISH", "confidence": 0.69}
    ]

def generate_mock_backtests():
    return [
        {
            "strategy_name": "Whale Following",
            "cagr": 0.4250,
            "sharpe_ratio": 2.15,
            "sortino_ratio": 2.80,
            "max_drawdown": 0.1850,
            "win_rate": 0.6230,
            "profit_factor": 1.95,
            "benchmark_cagr": 0.2840
        },
        {
            "strategy_name": "GNN Prediction Strategy",
            "cagr": 0.5820,
            "sharpe_ratio": 2.68,
            "sortino_ratio": 3.42,
            "max_drawdown": 0.1420,
            "win_rate": 0.6840,
            "profit_factor": 2.35,
            "benchmark_cagr": 0.2840
        },
        {
            "strategy_name": "Combined Alpha Strategy",
            "cagr": 0.6480,
            "sharpe_ratio": 2.95,
            "sortino_ratio": 3.85,
            "max_drawdown": 0.1150,
            "win_rate": 0.7120,
            "profit_factor": 2.60,
            "benchmark_cagr": 0.2840
        }
    ]

def generate_mock_alerts():
    return [
        {"alert_type": "Whale Transfer", "message": "FalconX Collector sent $4,500,000 in ETH to Binance 8 (Hot Wallet)", "severity": "WARNING"},
        {"alert_type": "Whale Accumulation", "message": "Jump Crypto accumulated $12,000,000 WBTC from Uniswap V3 over the last 4 hours", "severity": "INFO"},
        {"alert_type": "Exchange Inflow Spike", "message": "Exchange inflow spike detected: $45M ETH transferred into Kraken/Binance deposit wallets", "severity": "CRITICAL"},
        {"alert_type": "GNN Forecast Change", "message": "GNN 24h Prediction for ETH changed from NEUTRAL to BEARISH (Confidence: 69%)", "severity": "WARNING"},
        {"alert_type": "Whale Liquidation", "message": "vitalik.eth deposited $8,000,000 USDC into Aave Lending Pool v3", "severity": "INFO"}
    ]
