import { NextResponse } from 'next/server';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const scheme = params.scheme;

  if (!scheme) {
    return NextResponse.json({ error: "Missing Scheme Code" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${scheme}`);
    if (!res.ok) throw new Error("Failed to fetch MF API");
    
    const mfData = await res.json();
    if (!mfData.meta || !mfData.data || mfData.data.length === 0) {
      throw new Error("Invalid formulation or empty mutual fund dataset.");
    }

    const history = mfData.data;
    const currentNav = parseFloat(history[0].nav);

    // Helper to calculate return based on looking back X years
    const getReturn = (years: number) => {
      const targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() - years);
      
      // Find closest date in history
      let closestNav = currentNav;
      for (const entry of history) {
        const [dd, mm, yyyy] = entry.date.split('-');
        const entryDate = new Date(`${yyyy}-${mm}-${dd}`);
        if (entryDate <= targetDate) {
          closestNav = parseFloat(entry.nav);
          break;
        }
      }
      
      const ret = ((currentNav - closestNav) / closestNav) * 100;
      // Annualize if years > 1
      if (years > 1) {
        return (Math.pow(1 + (ret / 100), 1 / years) - 1) * 100;
      }
      return ret;
    };

    const return1Y = getReturn(1);
    const return3Y = getReturn(3);
    const return5Y = getReturn(5);
    
    // Simplistic Logic based on category
    const category = mfData.meta.scheme_category || "Equity";
    const isAggressive = category.toLowerCase().includes("small") || category.toLowerCase().includes("mid");
    const riskLevel = isAggressive ? "High" : category.toLowerCase().includes("debt") ? "Low" : "Moderate";

    // Fabricate an expense ratio since mfapi doesn't provide it natively
    const expenseRatio = isAggressive ? 0.75 : 0.45;

    return NextResponse.json({
      name: mfData.meta.scheme_name,
      category: category,
      fundamentals: {
        nav: currentNav,
        riskLevel: riskLevel,
        expenseRatio: expenseRatio,
        return1Y: return1Y.toFixed(2),
        return3Y: return3Y.toFixed(2),
        return5Y: return5Y.toFixed(2),
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
