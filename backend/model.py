import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from data import fetch_stock_data
from indicators import add_indicators

class StockModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.is_trained = False
        self.features = ['MA50', 'MA200', 'RSI', 'Daily_Return', 'Volume_Change']

    def train(self, df: pd.DataFrame):
        df_clean = df.dropna(subset=self.features + ['Target'])
        X = df_clean[self.features]
        y = df_clean['Target']
        if len(X) < 100:
            return # Not enough data
        self.model.fit(X, y)
        self.is_trained = True

    def get_rule_based_signal(self, current_data: pd.Series):
        ma50 = current_data['MA50']
        ma200 = current_data['MA200']
        
        if pd.isna(ma50) or pd.isna(ma200):
            return "HOLD"
            
        if ma50 > ma200:
            return "BUY"
        elif ma50 < ma200:
            return "SELL"
        return "HOLD"

    def predict(self, df: pd.DataFrame):
        latest = df.iloc[-1]
        
        # Rule-based for Phase 1
        rule_signal = self.get_rule_based_signal(latest)
        
        # ML-based for Phase 2
        ml_signal = rule_signal 
        confidence = 0.5
        
        if not self.is_trained:
            self.train(df)
            
        if self.is_trained:
            X_latest = pd.DataFrame([latest[self.features]])
            # Fill NaNs with 0 just in case
            X_latest = X_latest.fillna(0)
            pred = self.model.predict(X_latest)[0]
            proba = self.model.predict_proba(X_latest)[0]
            ml_signal = "BUY" if pred == 1 else "SELL"
            confidence = max(proba)
            
        return {
            "rule_based_signal": rule_signal,
            "ml_signal": ml_signal,
            "confidence": float(confidence),
            "latest_indicators": {
                "MA50": float(latest['MA50']) if not pd.isna(latest['MA50']) else None,
                "MA200": float(latest['MA200']) if not pd.isna(latest['MA200']) else None,
                "RSI": float(latest['RSI']) if not pd.isna(latest['RSI']) else None,
                "Close": float(latest['Close'])
            }
        }
