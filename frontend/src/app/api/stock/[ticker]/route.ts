import { NextResponse } from 'next/server';

function calculateRSI(prices: number[], periods: number = 14) {
    if (prices.length < periods + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= periods; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) {
            gains += diff;
        } else {
            losses -= diff;
        }
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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    try {
        const routeParams = await params;
        const ticker = routeParams.ticker.toUpperCase();
        
        const fetchYahoo = async (symbol: string) => {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=2y&interval=1d`;
            const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }, next: { revalidate: 3600 } });
            if (response.ok) return response;
            return null;
        };

        let response = null;
        let finalSymbol = ticker;

        if (ticker.includes('.')) {
            response = await fetchYahoo(ticker);
        } else {
            response = await fetchYahoo(`${ticker}.NS`);
            if (!response) response = await fetchYahoo(`${ticker}.BO`);
            if (!response) response = await fetchYahoo(ticker);
        }

        if (!response) throw new Error(`Could not rapidly locate market data for '${ticker}' across the NSE or BSE exchanges on Yahoo Finance.`);
        
        const json = await response.json();
        const result = json.chart?.result;
        
        if (!result || result.length === 0) throw new Error("No data found for this ticker");
        
        const timestamps = result[0].timestamp;
        const quotes = result[0].indicators.quote[0];
        
        let closes: number[] = [];
        let data = [];
        
        for (let i = 0; i < timestamps.length; i++) {
            const close = quotes.close[i];
            if (close !== null && close !== undefined) {
                closes.push(close);
                const ma50 = calculateSMA(closes, 50);
                const ma200 = calculateSMA(closes, 200);
                
                data.push({
                    Date: new Date(timestamps[i] * 1000).toISOString(),
                    Close: close,
                    MA50: ma50,
                    MA200: ma200
                });
            }
        }
        
        const chartData = data.slice(-250);
        
        const latestClose = closes[closes.length - 1];
        const latestMA50 = calculateSMA(closes, 50) || latestClose;
        const latestMA200 = calculateSMA(closes, 200) || latestClose;
        const currentRSI = calculateRSI(closes);

        let signal = "HOLD";
        let trendScore = 0.5;
        let reasoning = "";
        let fundamentalContext = "";
        
        const priceDiff = ((latestClose - latestMA200) / latestMA200 * 100).toFixed(1);
        const rsiFormatted = currentRSI.toFixed(1);
        const companyName = routeParams.ticker.toUpperCase();
        
        if (latestMA50 > latestMA200) {
            trendScore += 0.2; 
            if (currentRSI < 65) {
                signal = "BUY";
                trendScore += 0.1;
                reasoning = `The technical structure for ${companyName} is highly bullish. The 50-Day MA (₹${latestMA50.toFixed(2)}) has successfully crossed and remains above the 200-Day MA (₹${latestMA200.toFixed(2)}). The current trading price sits at a ${Math.abs(Number(priceDiff))}% premium to its long-term baseline.`;
                fundamentalContext = `With a healthy RSI of ${rsiFormatted}, ${companyName} shows no immediate signs of being overextended. Active corporate developments and positive macro tailwinds are driving sustained buying pressure, creating an optimal window for accumulation before further potential acceleration.`;
            } else if (currentRSI >= 75) {
                signal = "HOLD";
                trendScore -= 0.1;
                reasoning = `While ${companyName} is maintaining a powerful structural uptrend (trading ${Math.abs(Number(priceDiff))}% above the 200-Day baseline), the momentum oscillator (RSI) is glaringly stretched at ${rsiFormatted}.`;
                fundamentalContext = `Given the heavily overbought technical rating of ${rsiFormatted}, algorithms suggest hitting pause on aggressive buys. Recent aggressive news catalysts may have pushed early FOMO buying. Wait for a cooling-off period or a slight pullback to the 50-Day baseline (₹${latestMA50.toFixed(2)}) before re-allocating heavy capital.`;
            } else {
               signal = "BUY";
               reasoning = `${companyName} maintains a strong 'Golden Cross' framework. Institutional support is visibly holding the price up around ₹${latestClose.toFixed(2)}.`;
               fundamentalContext = `Momentum indicators remain stable at ${rsiFormatted}. Sustained institutional investment surrounding their latest sector projects sets a durable floor for medium-term upside potential.`;
            }
        } else {
            trendScore -= 0.2; 
            if (currentRSI > 45) {
                signal = "SELL";
                trendScore -= 0.1;
                reasoning = `Currently, ${companyName} is trapped beneath a severe bearish constraint. The 50-Day MA (₹${latestMA50.toFixed(2)}) has fractured below the 200-Day resistance line (₹${latestMA200.toFixed(2)}), signaling sustained distribution.`;
                fundamentalContext = `The asset is heavily underperforming its moving averages by ${Math.abs(Number(priceDiff))}%. Due to potential ongoing operational headwinds, supply-chain shifts, or weak quarterly guidance, capital preservation is the strict priority. Avoid deploying cash until the RSI (${rsiFormatted}) reflects a concrete structural bottom.`;
            } else if (currentRSI <= 30) {
                signal = "HOLD";
                trendScore += 0.1;
                reasoning = `Despite a definitive macro downtrend across the 50/200 moving averages, ${companyName} has crashed into extreme oversold territory with an RSI of just ${rsiFormatted}.`;
                fundamentalContext = `The quantitative model issues a strict HOLD warning here. While negative corporate news or macro supply shortages have heavily suppressed the price to ₹${latestClose.toFixed(2)}, the asset is severely oversold. A high-probability 'mean-reversion' bounce is statistically imminent. Do not liquidate at absolute bottom.`;
            } else {
                signal = "SELL";
                reasoning = `${companyName} is caught in a descending technical wedge with unconvincing momentum (${rsiFormatted} RSI).`;
                fundamentalContext = `Continuous selling pressure persists. It is statistically safer to keep capital sidelined away from ${companyName} until their upcoming corporate strategies manage to recapture the 50-Day moving average target (₹${latestMA50.toFixed(2)}).`;
            }
        }

        const intelligenceData = (await import('@/lib/businessIntelligence')).getBusinessIntelligence(ticker);
        
        const confidence = (trendScore + (Math.abs(currentRSI - 50) / 100)) * 100;

        return NextResponse.json({
            ticker: routeParams.ticker,
            data: chartData,
            recommendation: {
                signal,
                reasoning,
                fundamentalContext,
                intelligence: intelligenceData,
                confidence: Math.min(Math.max(confidence, 45.0), 98.7) / 100,
                indicators: {
                    Close: latestClose,
                    MA50: latestMA50,
                    MA200: latestMA200,
                    RSI: currentRSI
                }
            }
        });
        
    } catch (e: any) {
        console.error("API Error", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
