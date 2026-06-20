-- WhaleMind AI Schema Initializer

CREATE TABLE IF NOT EXISTS wallets (
    address VARCHAR(42) PRIMARY KEY,
    label VARCHAR(100),
    whale_score INT CHECK (whale_score BETWEEN 0 AND 100),
    influence_score INT CHECK (influence_score BETWEEN 0 AND 100),
    accumulation_score INT CHECK (accumulation_score BETWEEN 0 AND 100),
    distribution_score INT CHECK (distribution_score BETWEEN 0 AND 100),
    net_flow_24h NUMERIC(24, 4) DEFAULT 0.0,
    balance_usd NUMERIC(24, 2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount_usd NUMERIC(24, 2) NOT NULL,
    token VARCHAR(10) DEFAULT 'ETH',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS signals (
    id SERIAL PRIMARY KEY,
    factor_name VARCHAR(100) NOT NULL,
    coin VARCHAR(10) NOT NULL,
    signal_type VARCHAR(10) NOT NULL CHECK (signal_type IN ('BUY', 'HOLD', 'SELL')),
    predictive_power NUMERIC(5, 4) DEFAULT 0.0,
    correlation NUMERIC(5, 4) DEFAULT 0.0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    coin VARCHAR(10) NOT NULL,
    time_horizon VARCHAR(10) NOT NULL, -- '1h', '4h', '24h'
    prediction VARCHAR(10) NOT NULL CHECK (prediction IN ('BULLISH', 'NEUTRAL', 'BEARISH')),
    confidence NUMERIC(5, 4) NOT NULL, -- confidence score between 0 and 1
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backtests (
    id SERIAL PRIMARY KEY,
    strategy_name VARCHAR(100) UNIQUE NOT NULL,
    cagr NUMERIC(6, 4) NOT NULL,
    sharpe_ratio NUMERIC(5, 2) NOT NULL,
    sortino_ratio NUMERIC(5, 2) NOT NULL,
    max_drawdown NUMERIC(5, 4) NOT NULL,
    win_rate NUMERIC(5, 4) NOT NULL,
    profit_factor NUMERIC(5, 2) NOT NULL,
    benchmark_cagr NUMERIC(6, 4) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(10) DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for high throughput performance
CREATE INDEX IF NOT EXISTS idx_wallets_whale_score ON wallets(whale_score DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_from_addr ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to_addr ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_timestamp ON predictions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
