import pandas as pd
import numpy as np

def daily_returns(prices: pd.Series) -> pd.Series:
    """Calculates daily percentage change from a closing price series."""
    return prices.pct_change().dropna()

def annualized_volatility(returns: pd.Series) -> float:
    """Calculates annualized standard deviation of daily returns."""
    if len(returns) < 2:
        return np.nan
    return float(returns.std() * np.sqrt(252))

def sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.065) -> float:
    """
    Calculates annualized Sharpe Ratio.
    Formula: (Mean Daily Excess Return / Daily Volatility) * sqrt(252)
    """
    if len(returns) < 2:
        return np.nan
    
    daily_rf = risk_free_rate / 252
    excess_returns = returns - daily_rf
    std_dev = excess_returns.std()
    
    if std_dev == 0 or np.isnan(std_dev):
        return 0.0
        
    return float((excess_returns.mean() / std_dev) * np.sqrt(252))

def sortino_ratio(returns: pd.Series, risk_free_rate: float = 0.065) -> float:
    """
    Calculates annualized Sortino Ratio (penalizes only downside volatility).
    """
    if len(returns) < 2:
        return np.nan
        
    daily_rf = risk_free_rate / 252
    excess_returns = returns - daily_rf
    
    # Isolate negative excess returns for downside deviation
    downside = excess_returns[excess_returns < 0]
    
    if len(downside) < 1:
        return 0.0
        
    downside_std = downside.std()
    if downside_std == 0 or np.isnan(downside_std):
        return 0.0
        
    return float((excess_returns.mean() / downside_std) * np.sqrt(252))

def max_drawdown(prices: pd.Series) -> float:
    """Calculates the maximum percentage drop from a peak to a trough."""
    if len(prices) < 2:
        return np.nan
    rolling_max = prices.cummax()
    drawdowns = (prices - rolling_max) / rolling_max
    return float(drawdowns.min())