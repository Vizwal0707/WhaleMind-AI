from sqlalchemy import Column, String, Integer, Numeric, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from ..database import Base

class Wallet(Base):
    __tablename__ = 'wallets'

    address = Column(String(42), primary_key=True)
    label = Column(String(100))
    whale_score = Column(Integer, CheckConstraint('whale_score >= 0 AND whale_score <= 100'))
    influence_score = Column(Integer, CheckConstraint('influence_score >= 0 AND influence_score <= 100'))
    accumulation_score = Column(Integer, CheckConstraint('accumulation_score >= 0 AND accumulation_score <= 100'))
    distribution_score = Column(Integer, CheckConstraint('distribution_score >= 0 AND distribution_score <= 100'))
    net_flow_24h = Column(Numeric(24, 4), default=0.0)
    balance_usd = Column(Numeric(24, 2), default=0.0)
    created_at = Column(DateTime, server_default=func.now())

class Transaction(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True, index=True)
    hash = Column(String(66), unique=True, nullable=False)
    from_address = Column(String(42), nullable=False)
    to_address = Column(String(42), nullable=False)
    amount_usd = Column(Numeric(24, 2), nullable=False)
    token = Column(String(10), default='ETH')
    timestamp = Column(DateTime, server_default=func.now())

class Signal(Base):
    __tablename__ = 'signals'

    id = Column(Integer, primary_key=True, index=True)
    factor_name = Column(String(100), nullable=False)
    coin = Column(String(10), nullable=False)
    signal_type = Column(String(10), nullable=False) # 'BUY', 'HOLD', 'SELL'
    predictive_power = Column(Numeric(5, 4), default=0.0)
    correlation = Column(Numeric(5, 4), default=0.0)
    timestamp = Column(DateTime, server_default=func.now())

class Prediction(Base):
    __tablename__ = 'predictions'

    id = Column(Integer, primary_key=True, index=True)
    coin = Column(String(10), nullable=False)
    time_horizon = Column(String(10), nullable=False) # '1h', '4h', '24h'
    prediction = Column(String(10), nullable=False) # 'BULLISH', 'NEUTRAL', 'BEARISH'
    confidence = Column(Numeric(5, 4), nullable=False)
    timestamp = Column(DateTime, server_default=func.now())

class Backtest(Base):
    __tablename__ = 'backtests'

    id = Column(Integer, primary_key=True, index=True)
    strategy_name = Column(String(100), unique=True, nullable=False)
    cagr = Column(Numeric(6, 4), nullable=False)
    sharpe_ratio = Column(Numeric(5, 2), nullable=False)
    sortino_ratio = Column(Numeric(5, 2), nullable=False)
    max_drawdown = Column(Numeric(5, 4), nullable=False)
    win_rate = Column(Numeric(5, 4), nullable=False)
    profit_factor = Column(Numeric(5, 2), nullable=False)
    benchmark_cagr = Column(Numeric(6, 4), nullable=False)
    timestamp = Column(DateTime, server_default=func.now())

class Alert(Base):
    __tablename__ = 'alerts'

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(10), default='INFO') # 'INFO', 'WARNING', 'CRITICAL'
    timestamp = Column(DateTime, server_default=func.now())
