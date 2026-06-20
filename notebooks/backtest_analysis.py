# %% [markdown]
# # Strategy Backtesting Performance & Risk Analytics
# 
# This research notebook documents the mathematical analysis of strategy metrics, 
# CAGR, Sharpe ratio, Sortino ratio, max drawdown, and equity curves derived from whale net transaction flows.

# %%
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# %% [markdown]
# ## 1. Quantitative Formulations
# We define standard mathematical equations for quant auditing:

# %%
def calculate_cagr(initial_val, final_val, days):
    return (final_val / initial_val) ** (365.0 / days) - 1.0

def calculate_sharpe(daily_returns, risk_free_rate=0.0):
    mean_ret = np.mean(daily_returns)
    std_ret = np.std(daily_returns)
    if std_ret == 0:
        return 0.0
    return (mean_ret - risk_free_rate) / std_ret * np.sqrt(252)

def calculate_sortino(daily_returns, risk_free_rate=0.0):
    mean_ret = np.mean(daily_returns)
    downside_returns = daily_returns[daily_returns < 0]
    downside_std = np.std(downside_returns) if len(downside_returns) > 0 else 1e-6
    return (mean_ret - risk_free_rate) / downside_std * np.sqrt(252)

def calculate_max_drawdown(equity_curve):
    peak = equity_curve[0]
    max_dd = 0.0
    for val in equity_curve:
        if val > peak:
            peak = val
        dd = (val - peak) / peak
        if dd < max_dd:
            max_dd = dd
    return max_dd

# %% [markdown]
# ## 2. Run Strategy Simulation
# We simulate a 30-day trading execution to compare Sharpe, Sortino, and Max Drawdowns.

# %%
rng = np.random.default_rng(seed=123)
days = 30
initial_capital = 100000.0

# Base asset returns (HODL benchmark)
btc_returns = rng.normal(loc=0.0006, scale=0.015, size=days)

# Generate a mock whale flow indicator (-1.0 to +1.0) representing net inflows
whale_flow_indicator = rng.uniform(low=-0.8, high=0.9, size=days)

# Strategy returns (leveraged positions adjusted by whale flows)
combined_alpha_position = np.clip(whale_flow_indicator * 1.5, -1.0, 1.5)
combined_alpha_returns = combined_alpha_position * btc_returns - 0.0005  # subtract 0.05% rebalance fee

# Compute Equity Curves
btc_equity = [initial_capital]
alpha_equity = [initial_capital]

for i in range(days):
    btc_equity.append(btc_equity[-1] * (1 + btc_returns[i]))
    alpha_equity.append(alpha_equity[-1] * (1 + combined_alpha_returns[i]))

# Convert to numpy arrays
btc_returns_arr = np.array(btc_returns)
alpha_returns_arr = np.array(combined_alpha_returns)

# %% [markdown]
# ## 3. Analyze Comparative Quantitative Statistics

# %%
cagr_btc = calculate_cagr(initial_capital, btc_equity[-1], days)
cagr_alpha = calculate_cagr(initial_capital, alpha_equity[-1], days)

sharpe_btc = calculate_sharpe(btc_returns_arr)
sharpe_alpha = calculate_sharpe(alpha_returns_arr)

sortino_btc = calculate_sortino(btc_returns_arr)
sortino_alpha = calculate_sortino(alpha_returns_arr)

max_dd_btc = calculate_max_drawdown(btc_equity)
max_dd_alpha = calculate_max_drawdown(alpha_equity)

print("--- BACKTEST ANALYSIS REPORT ---")
print(f"BTC HODL CAGR      : {cagr_btc*100:.2f}%")
print(f"Combined Alpha CAGR : {cagr_alpha*100:.2f}%")
print(f"BTC Sharpe Ratio   : {sharpe_btc:.2f}")
print(f"Alpha Sharpe Ratio : {sharpe_alpha:.2f}")
print(f"BTC Sortino Ratio  : {sortino_btc:.2f}")
print(f"Alpha Sortino Ratio: {sortino_alpha:.2f}")
print(f"BTC Max Drawdown   : {max_dd_btc*100:.2f}%")
print(f"Alpha Max Drawdown : {max_dd_alpha*100:.2f}%")
