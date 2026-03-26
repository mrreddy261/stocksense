import { NextResponse } from 'next/server';

function calculateRSI(prices: number[], periods: number = 14) {
    if (prices.length < periods + 1) return 50;
    let gains = 0, losses = 0;
    
    for (let i = 1; i <= periods; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    let avgGain = gains / periods;
    let avgLoss = losses / periods;
    
    for (let i = periods + 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) {
            avgGain = (avgGain * 13 + diff) / 14;
            avgLoss = (avgLoss * 13) / 14;
        } else {
            avgGain = (avgGain * 13) / 14;
            avgLoss = (avgLoss * 13 - diff) / 14;
        }
    }
    const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
    return 100 - (100 / (1 + rs));
}

function calculateSMA(prices: number[], periods: number) {
    if (prices.length < periods) return null;
    return prices.slice(-periods).reduce((a, b) => a + b, 0) / periods;
}

const TICKERS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS", 
    "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "LT.NS", "BAJFINANCE.NS",
    "KOTAKBANK.NS", "AXISBANK.NS", "HINDUNILVR.NS", "ASIANPAINT.NS", "MARUTI.NS",
    "SUNPHARMA.NS", "TITAN.NS", "ULTRACEMCO.NS", "TATASTEEL.NS", "WIPRO.NS",
    "NTPC.NS", "BAJAJFINSV.NS", "POWERGRID.NS", "JSWSTEEL.NS", "HCLTECH.NS",
    "ADANIENT.NS", "M&M.NS", "TVSMOTOR.NS", "INDUSINDBK.NS", "GRASIM.NS",
    "TECHM.NS", "CIPLA.NS", "EICHERMOT.NS", "APOLLOHOSP.NS", "DIVISLAB.NS",
    "ONGC.NS", "BRITANNIA.NS", "HINDALCO.NS", "DRREDDY.NS", "BPCL.NS",
    "COALINDIA.NS", "TATAMOTORS.NS", "UPL.NS", "HEROMOTOCO.NS"
];

export async function GET() {
    try {
        const results: any[] = [];
        const targetPromises = [];
        
        // Batch 20 symbols per request to prevent URI limit exceptions
        for (let i = 0; i < TICKERS.length; i += 20) {
            const batch = TICKERS.slice(i, i + 20).join(",");
            const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${batch}&range=1y&interval=1d`;
            targetPromises.push(
                fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 1800 } }).then(r => r.json())
            );
        }

        const batchResponses = await Promise.all(targetPromises);
        
        batchResponses.forEach(batchData => {
            if (!batchData?.spark?.result) return;
            batchData.spark.result.forEach((stockObj: any) => {
                const symbol = stockObj.symbol;
                const response = stockObj.response[0];
                if (!response?.indicators?.quote?.[0]?.close) return;
                
                let closesRaw = response.indicators.quote[0].close;
                let closes = closesRaw.filter((v: any) => v !== null && v !== undefined);
                
                if (closes.length < 200) return; // Need at least 200 operational trading days for the 200-SMA
                
                const latestClose = closes[closes.length - 1];
                const latestMA50 = calculateSMA(closes, 50);
                const latestMA200 = calculateSMA(closes, 200);
                const currentRSI = calculateRSI(closes);

                if (!latestMA50 || !latestMA200) return;

                let signal = "HOLD";
                let trendScore = 0.5;
                
                if (latestMA50 > latestMA200) {
                    trendScore += 0.2; 
                    if (currentRSI < 65) { signal = "BUY"; trendScore += 0.1; } 
                    else if (currentRSI >= 75) { signal = "HOLD"; trendScore -= 0.1; }
                    else { signal = "BUY"; }
                } else {
                    trendScore -= 0.2;
                    if (currentRSI > 45) { signal = "SELL"; trendScore -= 0.1; } 
                    else if (currentRSI <= 30) { signal = "HOLD"; trendScore += 0.1; }
                    else { signal = "SELL"; }
                }
                
                const confidence = Math.min(Math.max(((trendScore + (Math.abs(currentRSI - 50) / 100)) * 100), 45.0), 98.7);
                
                results.push({
                    ticker: symbol.replace(".NS", "").replace(".BO", ""),
                    signal,
                    confidence,
                    price: latestClose,
                    ma50: latestMA50,
                    ma200: latestMA200,
                    rsi: currentRSI
                });
            });
        });

        results.sort((a, b) => b.confidence - a.confidence);

        const buys = results.filter(r => r.signal === 'BUY').slice(0, 15);
        const sells = results.filter(r => r.signal === 'SELL').slice(0, 15);

        return NextResponse.json({ buys, sells });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
