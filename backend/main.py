from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data import fetch_stock_data
from indicators import add_indicators
from model import StockModel

app = FastAPI(title="StockSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models_cache = {}

@app.get("/")
def read_root():
    return {"message": "Welcome to StockSense API"}

@app.get("/stock/{ticker}")
def get_stock_data(ticker: str):
    try:
        df = fetch_stock_data(ticker, period="1y")
        df = add_indicators(df)
        
        # Prepare for JSON
        df_json = df.fillna("").to_dict(orient="records")
        return {"ticker": ticker, "data": df_json}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/recommend/{ticker}")
def get_recommendation(ticker: str):
    try:
        df = fetch_stock_data(ticker, period="2y")
        df = add_indicators(df)
        
        if ticker not in models_cache:
            models_cache[ticker] = StockModel()
            
        model = models_cache[ticker]
        result = model.predict(df)
        
        # The prompt asks for Signal (BUY/SELL/HOLD), Confidence score, Latest indicators
        final_signal = result['ml_signal'] if result['confidence'] > 0.6 else result['rule_based_signal']
        
        return {
            "ticker": ticker.upper(),
            "signal": final_signal,
            "confidence": result['confidence'],
            "indicators": result['latest_indicators']
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=404, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
