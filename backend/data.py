import yfinance as yf
import pandas as pd

def fetch_stock_data(ticker: str, period: str = "2y"):
    """
    Fetches historical stock data.
    """
    # For Indian Stock Market, automatically append .NS (NSE) if no suffix is provided
    if "." not in ticker:
        ticker = f"{ticker}.NS"
        
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)
    if df.empty:
        raise ValueError(f"No data found for {ticker}")
    df = df.reset_index()
    # Ensure Date is timezone naive or formatted nicely
    df['Date'] = pd.to_datetime(df['Date']).dt.tz_localize(None)
    
    # Dropping multi-level column issues if any
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.droplevel(1)
        
    return df
