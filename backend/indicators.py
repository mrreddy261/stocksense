import pandas as pd
import numpy as np

def calculate_rsi(data: pd.Series, window: int = 14):
    delta = data.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def add_indicators(df: pd.DataFrame):
    """
    Adds technical indicators to the dataframe.
    """
    df = df.copy()
    
    # Ensure 'Close' and 'Volume' are float/int
    df['Close'] = pd.to_numeric(df['Close'], errors='coerce')
    df['Volume'] = pd.to_numeric(df['Volume'], errors='coerce')
    
    # Moving Averages
    df['MA50'] = df['Close'].rolling(window=50).mean()
    df['MA200'] = df['Close'].rolling(window=200).mean()
    
    # RSI
    df['RSI'] = calculate_rsi(df['Close'])
    
    # Daily returns
    df['Daily_Return'] = df['Close'].pct_change()
    
    # Volume changes
    df['Volume_Change'] = df['Volume'].pct_change()
    
    # Target variable for ML (Next day price movement: 1 if Up, 0 if Down)
    df['Target'] = (df['Close'].shift(-1) > df['Close']).astype(int)
    
    return df
