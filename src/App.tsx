import React, { useState, useEffect } from 'react';
import { Calculator, Bitcoin, TrendingUp, TrendingDown, AlertTriangle, DollarSign, PercentIcon } from 'lucide-react';

function App() {
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLossPrice, setStopLossPrice] = useState<number>(39000);
  const [targetPrice, setTargetPrice] = useState<number>(42000);
  const [leverage, setLeverage] = useState<number>(10);
  const [marginAmount, setMarginAmount] = useState<number>(1000);
  const [isLong, setIsLong] = useState<boolean>(true);
  const [calculations, setCalculations] = useState({
    positionSize: 0,
    potentialLoss: 0,
    potentialProfit: 0,
    liquidationPrice: 0,
    riskRewardRatio: 0,
    lossPercentage: 0,
    profitPercentage: 0,
  });

  useEffect(() => {
    // document.title = "Bitcoin Position Calculator";
    calculatePositionMetrics();
  }, [entryPrice, stopLossPrice, targetPrice, leverage, marginAmount, isLong]);


  const calculatePositionMetrics = () => {
    try {
      // Position size calculation (in BTC)
      const positionValue = marginAmount * leverage;
      const positionSize = positionValue / entryPrice;

      // For long positions
      let potentialLoss = 0;
      let potentialProfit = 0;
      let liquidationPrice = 0;
      
      if (isLong) {
        // Long position calculations
        potentialLoss = positionValue * Math.abs(entryPrice - stopLossPrice) / entryPrice;
        potentialProfit = positionValue * Math.abs(targetPrice - entryPrice) / entryPrice;
        
        // Simplified liquidation price calculation (approximation)
        // Actual liquidation depends on exchange's specific formula
        liquidationPrice = entryPrice * (1 - (1 / leverage) * 0.9); // 0.9 is a safety buffer
      } else {
        // Short position calculations
        potentialLoss = positionValue * Math.abs(stopLossPrice - entryPrice) / entryPrice;
        potentialProfit = positionValue * Math.abs(entryPrice - targetPrice) / entryPrice;
        
        // Simplified liquidation price for shorts
        liquidationPrice = entryPrice * (1 + (1 / leverage) * 0.9); // 0.9 is a safety buffer
      }

      // Risk to reward ratio
      const riskRewardRatio = potentialProfit / potentialLoss;
      
      // Loss and profit percentages relative to margin
      const lossPercentage = (potentialLoss / marginAmount) * 100;
      const profitPercentage = (potentialProfit / marginAmount) * 100;

      setCalculations({
        positionSize,
        potentialLoss,
        potentialProfit,
        liquidationPrice,
        riskRewardRatio,
        lossPercentage,
        profitPercentage,
      });
    } catch (error) {
      console.error("Calculation error:", error);
    }
  };

  const isLiquidationRisky = () => {
    if (isLong) {
      return stopLossPrice < calculations.liquidationPrice;
    } else {
      return stopLossPrice > calculations.liquidationPrice;
    }
  };

  const handleLeverageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 1000) {
      setLeverage(value);
    }
  };

  

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <Bitcoin className="text-yellow-500 mr-2" size={32} />
            <h1 className="text-3xl font-bold">Bitcoin Futures Calculator</h1>
          </div>
          <p className="text-gray-400">Calculate position size, profit/loss, and risk for BTC futures trades</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calculator className="mr-2" size={20} />
              Input Parameters
            </h2>

            <div className="mb-6">
              <div className="flex justify-between mb-4">
                <button
                  className={`flex-1 py-2 rounded-l-lg flex items-center justify-center ${
                    isLong ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                  onClick={() => setIsLong(true)}
                >
                  <TrendingUp className="mr-2" size={18} />
                  Long
                </button>
                <button
                  className={`flex-1 py-2 rounded-r-lg flex items-center justify-center ${
                    !isLong ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                  onClick={() => setIsLong(false)}
                >
                  <TrendingDown className="mr-2" size={18} />
                  Short
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1">Entry Price (USD)</label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                />  
              </div>

              <div>
                <label className="block text-gray-400 mb-1">
                  {isLong ? 'Stop Loss Price (USD)' : 'Stop Loss Price (USD)'}
                </label>
                <input
                  type="number"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                  className={`w-full rounded px-3 py-2 text-white ${
                    isLong
                      ? stopLossPrice >= entryPrice
                        ? 'bg-red-900 border border-red-500'
                        : 'bg-gray-700'
                      : stopLossPrice <= entryPrice
                      ? 'bg-red-900 border border-red-500'
                      : 'bg-gray-700'
                  }`}
                />
                {isLong && stopLossPrice >= entryPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    Stop loss should be below entry price for long positions
                  </p>
                )}
                {!isLong && stopLossPrice <= entryPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    Stop loss should be above entry price for short positions
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 mb-1">
                  {isLong ? 'Target Price (USD)' : 'Target Price (USD)'}
                </label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                  className={`w-full rounded px-3 py-2 text-white ${
                    isLong
                      ? targetPrice <= entryPrice
                        ? 'bg-red-900 border border-red-500'
                        : 'bg-gray-700'
                      : targetPrice >= entryPrice
                      ? 'bg-red-900 border border-red-500'
                      : 'bg-gray-700'
                  }`}
                />
                {isLong && targetPrice <= entryPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    Target price should be above entry price for long positions
                  </p>
                )}
                {!isLong && targetPrice >= entryPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    Target price should be below entry price for short positions
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Leverage (1-1000x)</label>
                <div className="flex items-center mb-2">
                  <input
                    type="range"
                    min="1"
                    max="1000"
                    value={leverage}
                    onChange={(e) => setLeverage(parseInt(e.target.value))}
                    className="w-full mr-3"
                  />
                  <div className="w-16 bg-gray-700 rounded px-3 py-2 text-center">
                    {leverage}x
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="text-gray-400 text-sm mr-2">Custom leverage:</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={leverage}
                    onChange={handleLeverageInputChange}
                    className="w-24 bg-gray-700 rounded px-3 py-2 text-white"
                    placeholder="1-1000"
                  />
                  <span className="ml-2 text-gray-400">x</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Margin Amount (USD)</label>
                <input
                  type="number"
                  value={marginAmount}
                  onChange={(e) => setMarginAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <DollarSign className="mr-2" size={20} />
              Calculation Results
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Position Size</p>
                  <p className="text-xl font-semibold">
                    {calculations.positionSize.toFixed(8)} BTC
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    ${(calculations.positionSize * entryPrice).toFixed(2)} USD
                  </p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Risk/Reward Ratio</p>
                  <p className="text-xl font-semibold">
                    1:{calculations.riskRewardRatio.toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    <PercentIcon className="inline mr-1" size={14} />
                    {calculations.riskRewardRatio >= 2 ? 'Good' : 'Risky'} R:R ratio
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-900/40 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm mb-1">Potential Loss</p>
                  <p className="text-xl font-semibold text-red-400">
                    -${calculations.potentialLoss.toFixed(2)}
                  </p>
                  <p className="text-red-400 text-sm mt-1">
                    -{calculations.lossPercentage.toFixed(2)}% of margin
                  </p>
                </div>

                <div className="bg-green-900/40 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm mb-1">Potential Profit</p>
                  <p className="text-xl font-semibold text-green-400">
                    +${calculations.potentialProfit.toFixed(2)}
                  </p>
                  <p className="text-green-400 text-sm mt-1">
                    +{calculations.profitPercentage.toFixed(2)}% of margin
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isLiquidationRisky() ? 'bg-red-900/60' : 'bg-gray-700'}`}>
                <div className="flex items-start">
                  <AlertTriangle 
                    className={`mr-2 ${isLiquidationRisky() ? 'text-red-400' : 'text-yellow-400'}`} 
                    size={20} 
                  />
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Liquidation Price (Est.)</p>
                    <p className="text-xl font-semibold">
                      ${calculations.liquidationPrice.toFixed(2)}
                    </p>
                    {isLiquidationRisky() && (
                      <p className="text-red-400 text-sm mt-1 font-semibold">
                        WARNING: Stop loss is beyond liquidation price!
                      </p>
                    )}
                    <p className="text-gray-400 text-sm mt-1">
                      {isLong ? 'Price must fall' : 'Price must rise'} by{' '}
                      {(Math.abs(entryPrice - calculations.liquidationPrice) / entryPrice * 100).toFixed(2)}% to liquidate
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Disclaimer: This calculator provides estimates only. Actual results may vary based on exchange fees, 
            funding rates, and specific liquidation mechanisms.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;