import React, { useState, useEffect, useCallback } from 'react';
import WidgetCard from '../components/common/WidgetCard';
import { AppState, Contribution } from '../types';
import {
  DEFAULT_OVERALL_TARGET_COP,
  EXCHANGE_RATE_API_URL_ERAPI,
  FALLBACK_EXCHANGE_RATE,
  FIXED_FEE_USD,
  PERCENTAGE_FEE,
  MIN_USD_INPUT_FOR_NET_CALC
} from '../constants';

interface IngresosPageProps {
  appState: AppState;
  updateAppState: (data: Partial<AppState>) => Promise<void>;
}

// Helper to format currency
const formatCurrency = (amount: number, currency: 'USD' | 'COP'): string => {
  return new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(amount);
};


const IngresosPage: React.FC<IngresosPageProps> = ({ appState, updateAppState }) => {
  const [moneyInput, setMoneyInput] = useState('');
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number | null>(FALLBACK_EXCHANGE_RATE);
  const [overallTargetInput, setOverallTargetInput] = useState<string>(String(appState.overallTargetCOP || DEFAULT_OVERALL_TARGET_COP));
  const [isRateLoading, setIsRateLoading] = useState(true);

  const fetchExchangeRate = useCallback(async () => {
    setIsRateLoading(true);
    try {
      const response = await fetch(EXCHANGE_RATE_API_URL_ERAPI);
      if (!response.ok) throw new Error('Network response error fetching exchange rate');
      const data = await response.json();
      setCurrentExchangeRate(data.rates.COP || FALLBACK_EXCHANGE_RATE);
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      setCurrentExchangeRate(FALLBACK_EXCHANGE_RATE); // Use fallback
    } finally {
      setIsRateLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  useEffect(() => {
    // Sync local input state when the prop changes
    setOverallTargetInput(String(appState.overallTargetCOP || DEFAULT_OVERALL_TARGET_COP));
  }, [appState.overallTargetCOP]);


  const handleAddMoney = async () => {
    if (!currentExchangeRate) {
      alert("Tasa de cambio no disponible, por favor espera.");
      return;
    }
    const rawAmount = parseFloat(moneyInput);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      alert(`⚠️ Ingrese un monto válido.`);
      return;
    }

    let netAmountUSD = 0;
    let netAmountCOP = 0;
    let originalGrossAmountUSD = 0;

    if (appState.selectedInputCurrencyIngresos === 'USD') {
      originalGrossAmountUSD = rawAmount;
      if (originalGrossAmountUSD < MIN_USD_INPUT_FOR_NET_CALC) {
        alert(`⚠️ El monto bruto en USD debe ser mayor a ${formatCurrency(MIN_USD_INPUT_FOR_NET_CALC, 'USD')} para cubrir comisiones.`);
        return;
      }
      const amountAfterFixedFee = originalGrossAmountUSD - FIXED_FEE_USD;
      netAmountUSD = amountAfterFixedFee * (1 - PERCENTAGE_FEE);
      netAmountCOP = netAmountUSD * currentExchangeRate;
    } else { // Input is COP
      netAmountCOP = rawAmount;
      netAmountUSD = netAmountCOP / currentExchangeRate;
      // Approximate original gross USD if input was COP (for informational purposes if needed)
      originalGrossAmountUSD = (netAmountUSD / (1-PERCENTAGE_FEE)) + FIXED_FEE_USD;
    }

    const now = new Date();
    const newContribution: Contribution = {
      id: `contr_${Date.now()}`,
      amountUSD: netAmountUSD,
      amountCOP: netAmountCOP,
      originalAmountUSD: originalGrossAmountUSD,
      exchangeRate: currentExchangeRate,
      date: now.toISOString(),
      monthYear: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    };

    await updateAppState({ contributions: [...appState.contributions, newContribution] });
    setMoneyInput('');
  };

  const handleClearHistory = async () => {
    const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const currentMonthName = new Date().toLocaleString('es-CO', { month: 'long', year: 'numeric' });

    if (window.confirm(`🤔 ¿Estás seguro de que quieres limpiar el historial de ingresos y la meta específica para ${currentMonthName}? Los datos de meses pasados no se verán afectados.`)) {
      const updatedContributions = appState.contributions.filter(c => c.monthYear !== currentMonthKey);

      const updatedMonthlyTargets = { ...appState.monthlyTargets };
      delete updatedMonthlyTargets[currentMonthKey]; 

      try {
        await updateAppState({
          contributions: updatedContributions,
          monthlyTargets: updatedMonthlyTargets
        });
        // Explicitly set the input to reflect the default target,
        // as the specific target for the current month has been removed.
        // App.tsx's updateAndPersistAppState will also ensure appState.overallTargetCOP is DEFAULT_OVERALL_TARGET_COP.
        setOverallTargetInput(String(DEFAULT_OVERALL_TARGET_COP)); 
      } catch (error) {
        console.error("Error clearing current month history:", error);
        alert("Hubo un error al intentar limpiar el historial del mes actual.");
      }
    }
  };

  const handleTargetChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTargetValue = e.target.value;
    setOverallTargetInput(newTargetValue); 

    const newTarget = parseFloat(newTargetValue);
    const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    if (!isNaN(newTarget) && newTarget > 0) {
        const updatedMonthlyTargets = { ...appState.monthlyTargets, [currentMonthKey]: newTarget };
        await updateAppState({ monthlyTargets: updatedMonthlyTargets, overallTargetCOP: newTarget });
    } else if (newTargetValue === '' || newTarget <= 0) { 
        const updatedMonthlyTargets = { ...appState.monthlyTargets };
        delete updatedMonthlyTargets[currentMonthKey]; 
        await updateAppState({ monthlyTargets: updatedMonthlyTargets });
    }
  };


  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAppState({ selectedInputCurrencyIngresos: e.target.value as 'USD' | 'COP' });
  };

  // Calculations remain the same, derived from appState props
  const totalCOPSavedOverall = appState.contributions.reduce((s, c) => s + c.amountCOP, 0);
  const totalUSDSavedOverall = appState.contributions.reduce((s, c) => s + c.amountUSD, 0);

  const currentMonthKeyDisplay = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const totalUSDSavedThisMonth = appState.contributions
    .filter(c => c.monthYear === currentMonthKeyDisplay)
    .reduce((s, c) => s + c.amountUSD, 0);

  const currentOverallTargetCOP = appState.overallTargetCOP;
  const percentageOverall = currentOverallTargetCOP > 0 ? Math.min((totalCOPSavedOverall / currentOverallTargetCOP) * 100, 100) : 0;
  const remainingOverallCOP = Math.max(currentOverallTargetCOP - totalCOPSavedOverall, 0);

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthlyTimeProgress = (dayOfMonth / daysInMonth) * 100;
  const currentMonthNameForDisplay = `🗓️ ${now.toLocaleString('es-CO', { month: 'long' }).charAt(0).toUpperCase() + now.toLocaleString('es-CO', { month: 'long' }).slice(1)} de ${now.getFullYear()}`;

  const savingsByMonth: { [key: string]: number } = {};
  appState.contributions.forEach(c => {
    savingsByMonth[c.monthYear] = (savingsByMonth[c.monthYear] || 0) + c.amountCOP;
  });
  const allGoalMonths = new Set([...Object.keys(appState.monthlyTargets), ...Object.keys(savingsByMonth)]);
  const sortedGoalMonths = Array.from(allGoalMonths).sort((a,b) => b.localeCompare(a));

  return (
    <WidgetCard className="w-full max-w-2xl" id="ingresos-widget-main">
      <div className="bg-bg-card-light text-accent-blue-info py-2 px-3 rounded-lg shadow-md mb-4 text-lg font-medium">
        {currentMonthNameForDisplay}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
        <h1 className="text-2xl text-accent-blue-info font-bold">🎯 Meta Ingresos</h1>
        <div className="flex items-center gap-2 bg-bg-card-light p-2 rounded-lg shadow-sm border border-text-primary/10">
          <label htmlFor="overallTargetInput" className="text-sm text-text-secondary">Meta (COP):</label>
          <input
            type="number"
            id="overallTargetInput"
            value={overallTargetInput} 
            onChange={handleTargetChange}
            step="1000"
            placeholder={String(DEFAULT_OVERALL_TARGET_COP)}
            className="w-32 p-1.5 border border-bg-card-light rounded-md bg-bg-dark text-text-primary text-right text-sm focus:border-accent-blue-info focus:ring-1 focus:ring-accent-blue-info outline-none"
          />
        </div>
      </div>
      <p className="text-text-secondary text-base mb-6">🚀 Progreso hacia tu meta de {formatCurrency(currentOverallTargetCOP, 'COP')}</p>

      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
          <label htmlFor="currencySelectorIngresos" className="text-sm text-text-secondary">Moneda de Ingreso:</label>
          <select
            id="currencySelectorIngresos"
            value={appState.selectedInputCurrencyIngresos}
            onChange={handleCurrencyChange}
            className="py-2 px-3 rounded-lg border border-bg-card-light bg-bg-dark text-text-primary text-sm cursor-pointer focus:border-accent-blue-info focus:ring-1 focus:ring-accent-blue-info outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="COP">COP ($)</option>
          </select>
        </div>
        <input
          type="number"
          id="moneyInputIngresos"
          value={moneyInput}
          onChange={(e) => setMoneyInput(e.target.value)}
          placeholder={`💵 Ingresa cantidad en ${appState.selectedInputCurrencyIngresos}...`}
          min="0.01"
          step="0.01"
          className="w-full p-3.5 border-2 border-bg-card-light rounded-xl text-lg text-center bg-bg-dark text-text-primary focus:border-accent-blue-info focus:ring-2 focus:ring-accent-blue-info/50 outline-none transition-colors"
        />
        <button
          id="addMoneyBtnIngresos"
          onClick={handleAddMoney}
          disabled={isRateLoading}
          className="w-full bg-gradient-to-r from-accent-green-medium to-accent-green-neon text-black py-3.5 rounded-xl text-base font-bold cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-green-neon disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none animate-pulseButton"
        >
          ➕ Añadir Ingreso
        </button>
         <style>{`
            @keyframes pulseButton { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
            .animate-pulseButton { animation: pulseButton 2s infinite ease-in-out 1s; }
            .animate-pulseButton:hover { animation-play-state: paused; }
        `}</style>
      </div>

      <div className="my-6 space-y-5">
        <div>
          <div className="w-full h-5 bg-slate-700 rounded-full shadow-inner overflow-hidden">
            <div
              id="progressBarOverall"
              className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-green-dark to-accent-green-medium relative animate-shimmer-progress"
              style={{ width: `${percentageOverall}%`, boxShadow: '0 0 12px 2px rgba(80, 250, 123, 0.4)' }}
            />
          </div>
          <div className="mt-3 text-lg font-medium text-text-primary">{percentageOverall.toFixed(1)}% 📊</div>
        </div>
        <div>
          <div className="w-full h-7 bg-slate-700 rounded-full shadow-inner overflow-hidden">
            <div
              id="progressBarMonthly"
              className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-dark to-accent-blue-info relative animate-shimmer-progress"
              style={{ width: `${monthlyTimeProgress}%`, boxShadow: '0 0 12px 2px rgba(139, 233, 253, 0.4)' }}
            />
          </div>
          <div className="mt-3 text-base text-text-secondary">🗓️ Tiempo del Mes: {monthlyTimeProgress.toFixed(0)}%</div>
        </div>
         <style>{`
            @keyframes shimmerProgress {
                0% { background-position: -800px 0; }
                100% { background-position: 800px 0; }
            }
            .animate-shimmer-progress::before {
                content:'';
                position:absolute;
                top:0;left:0;
                height:100%;
                width:100%;
                background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.05) 60%, transparent 100%);
                background-size: 800px 100%;
                background-repeat: no-repeat;
                animation: shimmerProgress 3.5s infinite linear;
                border-radius: inherit;
            }
        `}</style>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {[
          { label: "💚 Total Ingresos Netos Acumulados (COP)", value: formatCurrency(totalCOPSavedOverall, 'COP'), colorClass: "text-accent-green-medium" },
          { label: "🏁 Meta General Actual (COP)", value: formatCurrency(currentOverallTargetCOP, 'COP'), colorClass: "text-accent-blue-info" },
          { label: "📈 Restante Meta General (COP)", value: formatCurrency(remainingOverallCOP, 'COP'), colorClass: "text-accent-yellow-green" },
          { label: "💵 Ingresos Netos este Mes (USD)", value: formatCurrency(totalUSDSavedThisMonth, 'USD'), colorClass: "text-accent-blue-info" },
        ].map(item => (
          <WidgetCard key={item.label} className="p-4 !mb-0 hover:scale-105 hover:-translate-y-1 transition-transform duration-300">
            <div className="text-sm text-text-secondary mb-1.5 font-medium">{item.label}</div>
            <div className={`text-xl font-bold ${item.colorClass}`}>{item.value}</div>
          </WidgetCard>
        ))}
      </div>
      <WidgetCard className="p-4 mt-4 !mb-0 hover:scale-105 hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm text-text-secondary mb-1.5 font-medium">🌍 Total Ingresos Netos Histórico (USD)</div>
          <div className="text-xl font-bold text-accent-gold">{formatCurrency(totalUSDSavedOverall, 'USD')}</div>
          <div className="text-xs text-text-secondary mt-1">
            Tasa actual: {isRateLoading ? "Actualizando..." : currentExchangeRate ? `1 USD = ${formatCurrency(currentExchangeRate, 'COP')}` : "No disponible"}
          </div>
      </WidgetCard>

      {totalCOPSavedOverall >= currentOverallTargetCOP && currentOverallTargetCOP > 0 && (
        <div
            className="my-5 p-5 bg-pastel-green-celebration text-celebration-text rounded-2xl text-xl font-bold animate-bounceAndGlow"
            style={{ textShadow: '0 0 8px rgba(0,0,0,0.1)', boxShadow: '0 0 20px var(--celebration-glow)'}}
        >
          🎉✨ ¡FELICITACIONES! ¡META GENERAL ALCANZADA! ✨🎉<br /> 🏆 ¡Eres un maestro del joseo! Te amo. 🏆
           <style>{`
            @keyframes bounceAndGlow {
              0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 0 15px #6ee7b7, 0 0 25px #6ee7b7; }
              50% { transform: translateY(-6px) scale(1.02); box-shadow: 0 0 30px #6ee7b7, 0 0 45px #6ee7b7, 0 0 10px #e0ffe0; }
            }
            .animate-bounceAndGlow { animation: bounceAndGlow 1.2s infinite alternate; }
          `}</style>
        </div>
      )}

      <div className="mt-6 space-y-6 text-left">
        <WidgetCard className="p-4 !mb-0">
          <h3 className="text-text-primary text-lg font-bold mb-3 text-center">📝 Historial Detallado de Ingresos (Netos)</h3>
          <div className="max-h-48 overflow-y-auto bg-bg-dark rounded-xl p-4 border border-text-primary/10 custom-scrollbar">
            {appState.contributions.length === 0 ? (
              <p className="text-center text-text-secondary py-5">🌱 Sin ingresos aún.</p>
            ) : (
              [...appState.contributions].reverse().map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 my-1.5 bg-bg-card-light rounded-lg border-l-4 border-accent-green-medium hover:bg-bg-card hover:translate-x-0.5 transition-all">
                  <div>
                    <div className="text-sm text-text-secondary font-medium">📅 {new Date(c.date).toLocaleDateString('es-CO')} - {new Date(c.date).toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}</div>
                    <div className="font-bold text-text-primary">{formatCurrency(c.amountUSD, 'USD')} <span className="text-xs text-accent-blue-info">(@{c.exchangeRate.toFixed(0)})</span></div>
                    {c.originalAmountUSD && c.originalAmountUSD !== c.amountUSD && <div className="text-xs text-text-secondary">Bruto: {formatCurrency(c.originalAmountUSD, 'USD')}</div>}
                  </div>
                  <div className="font-bold text-accent-green-medium">{formatCurrency(c.amountCOP, 'COP')}</div>
                </div>
              ))
            )}
          </div>
        </WidgetCard>

        <WidgetCard className="p-4 !mb-0">
          <h3 className="text-text-primary text-lg font-bold mb-3 text-center">🎯 Progreso Ingresos Mensuales (Netos vs Meta)</h3>
          <div className="max-h-48 overflow-y-auto bg-bg-dark rounded-xl p-4 border border-text-primary/10 custom-scrollbar">
            {sortedGoalMonths.length === 0 ? (
               <p className="text-center text-text-secondary py-5">Aún no hay historial de meses.</p>
            ) : (
              sortedGoalMonths.map(monthYear => {
                const savedThisMonth = savingsByMonth[monthYear] || 0;
                const targetThisMonth = appState.monthlyTargets[monthYear] || DEFAULT_OVERALL_TARGET_COP; // Fallback to default if no specific target
                const [year, monthNum] = monthYear.split('-');
                const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('es-CO', { month: 'long', year: 'numeric' });

                let statusText, statusClass;
                if (targetThisMonth > 0 && savedThisMonth >= targetThisMonth) {
                    statusText = `✅ ¡Cumplido! (${formatCurrency(savedThisMonth, 'COP')} de ${formatCurrency(targetThisMonth, 'COP')})`;
                    statusClass = 'text-accent-green-neon';
                } else if (targetThisMonth > 0) {
                    statusText = `⏳ En Progreso (${formatCurrency(savedThisMonth, 'COP')} de ${formatCurrency(targetThisMonth, 'COP')})`;
                    statusClass = 'text-text-secondary';
                } else {
                    statusText = `(${formatCurrency(savedThisMonth, 'COP')} de ${formatCurrency(targetThisMonth, 'COP')}) (Sin meta mensual específica)`;
                    statusClass = 'text-text-secondary';
                }

                return (
                  <div key={monthYear} className="flex justify-between items-center p-3 my-1.5 bg-bg-card-light rounded-lg hover:bg-bg-card transition-colors">
                    <div className="text-sm text-text-secondary font-medium">{monthName}</div>
                    <div className={`text-sm font-bold ${statusClass}`}>{statusText}</div>
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={handleClearHistory}
            className="w-full sm:w-auto mt-4 bg-gradient-to-r from-accent-red-clear to-red-600 text-text-primary py-2.5 px-5 rounded-lg text-sm font-bold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-red"
          >
            🗑️ Limpiar Historial del Mes Actual
          </button>
        </WidgetCard>
      </div>
    </WidgetCard>
  );
};

export default IngresosPage;
