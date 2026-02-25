"use client";
import {
  IStatisticsProps,
  IStoreInfo,
} from "@/interfaces/types";
import React, { useEffect, useState, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { parse, format } from "date-fns";
import { es } from "date-fns/locale";

const Statistics: React.FC<IStatisticsProps> = ({ storeId }) => {
  const [storeInfo, setStoreInfo] = useState<IStoreInfo | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const { userData } = useAppContext();
  const kazuo_back = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await fetch(`${kazuo_back}/store/${storeId}`);
        const dataStore = await response.json();
        if (response.ok) {
          setStoreInfo(dataStore.storeFound);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (storeId) {
        fetchStoreInfo();
    }
  }, [storeId, kazuo_back]);

  const formattedDate = useMemo(() => {
    if (!storeInfo?.createdAt) return "Fecha no disponible";
    try {
      const date = parse(storeInfo.createdAt, "yyyy-MM-dd'T'HH:mm:ss.SSSX", new Date());
      if (isNaN(date.getTime())) return "Fecha inválida";
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      return "Fecha no disponible";
    }
  }, [storeInfo]);

  const kpis = useMemo(() => {
    if (!storeInfo?.products) return { totalProducts: 0, estimatedSales: 0, totalCost: 0, profit: 0, margin: 0, totalSalesAmount: 0, totalCostAmount: 0 };
    
    const products = storeInfo.products;
    
    // Calculate totals based on Quantity * Price
    const totalProducts = products.reduce((acc, p) => acc + Number(p.quantity), 0);
    const totalCostAmount = products.reduce((acc, p) => acc + (Number(p.inPrice) * Number(p.quantity)), 0);
    const totalSalesAmount = products.reduce((acc, p) => acc + (Number(p.outPrice) * Number(p.quantity)), 0);
    
    const profit = totalSalesAmount - totalCostAmount;
    const margin = totalSalesAmount > 0 ? (profit / totalSalesAmount) * 100 : 0;

    return {
        totalProducts,
        totalCost: totalCostAmount,
        estimatedSales: totalSalesAmount,
        profit,
        margin,
        totalSalesAmount,
        totalCostAmount
    };
  }, [storeInfo]);

  // Prepare data for the bar chart (Top 25 products by quantity)
  const barChartData = useMemo(() => {
    if (!storeInfo?.products) return [];
    // Sort by quantity desc and take top 25
    return [...storeInfo.products]
      .sort((a, b) => Number(b.quantity) - Number(a.quantity))
      .slice(0, 25);
  }, [storeInfo]);

  // Calculate max quantity for bar chart scaling
  const maxQuantity = useMemo(() => {
    if (barChartData.length === 0) return 100;
    return Math.max(...barChartData.map(p => Number(p.quantity)));
  }, [barChartData]);

  // Pie chart calculations
  const pieChartData = useMemo(() => {
     const total = kpis.estimatedSales + kpis.totalCost; // This logic in the example was weird (Sales vs Cost).
     // Example used Sales vs Cost to show "Profit" margin.
     // Let's stick to the visual: Cost circle vs Sales circle.
     // If Sales > Cost, Sales circle is bigger?
     // The example shows: Circle Background (Cost) - Blue. Overlay (Sales) - Green (dashed).
     // And "Margin" text in center.
     // Let's assume we want to show Cost % vs Sales % relative to Sales?
     // Or just Cost as a % of Sales?
     // Example: Cost 35%, Sales 65%. This sums to 100%. This implies "Revenue Breakdown".
     // Profit = Sales - Cost.
     // So Pie = Cost (Blue) + Profit (Green)?
     // Let's do: Cost Percentage = (TotalCost / TotalSales) * 100.
     // Profit Percentage = (Profit / TotalSales) * 100.
     
     let costPct = 0;
     let profitPct = 0;
     
     if (kpis.estimatedSales > 0) {
        costPct = (kpis.totalCost / kpis.estimatedSales) * 100;
        profitPct = 100 - costPct;
     }

     // Clamp for visual sanity
     if (costPct > 100) costPct = 100; // Loss
     if (costPct < 0) costPct = 0;

     // The SVG in example uses stroke-dasharray="65 35" which means 65 visible, 35 gap.
     // We need to calculate this string.
     // stroke-dasharray="visible gap". Circumference is ~100 (if r=15.915...).
     // 2 * pi * 15.915... approx 100.
     // So value is percentage.
     
     return { costPct, profitPct };
  }, [kpis]);


  if (!storeInfo) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="text-slate-500 animate-pulse">Cargando estadísticas...</div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* Navbar is handled by global layout */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- CABECERA DE LA PÁGINA --- */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
             <div className="flex items-center gap-2 text-sm text-sky-600 font-semibold mb-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                HISTORIAL DE ALMACÉN
             </div>
             <h1 className="text-3xl font-extrabold text-slate-800">{storeInfo.name}</h1>
             <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               Actualizado: {formattedDate}
             </p>
          </div>
        </header>

        {/* --- KPIs --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" id="tour-statistics-section">
           <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Unidades</p>
                <p className="text-2xl font-bold text-slate-800">{kpis.totalProducts.toLocaleString()}</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Ventas Estimadas</p>
                <p className="text-2xl font-bold text-slate-800">${kpis.estimatedSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Costo Total</p>
                <p className="text-2xl font-bold text-slate-800">${kpis.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
           </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">DATOS DE INTERÉS</h2>

        {/* --- SECCIÓN DE GRÁFICOS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GRÁFICO 1: Barras (Ocupa 2 columnas) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Inventario de Productos</h3>
              <p className="text-sm text-slate-500">Top 25 productos con mayor inventario</p>
            </div>
            
            <div className="flex-1 relative h-64 flex items-end justify-between gap-1 sm:gap-2 pb-6 border-b border-slate-100">
              {/* Eje Y (Simulado Dinámicamente) */}
              <div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between pointer-events-none z-0">
                 {[100, 80, 60, 40, 20, 0].map(pct => (
                   <div key={pct} className="w-full flex items-center text-xs text-slate-300">
                      <span className="w-8">{Math.round((maxQuantity * pct) / 100)}</span>
                      <div className="flex-1 h-px bg-slate-50 ml-2"></div>
                   </div>
                 ))}
              </div>

              {/* Barras */}
              <div className="relative z-10 w-full h-full flex items-end justify-between gap-[2px] sm:gap-1.5 pl-10 pt-4">
                 {barChartData.map((prod, idx) => {
                   const heightPct = (Number(prod.quantity) / maxQuantity) * 100;
                   return (
                     <div key={prod.id || idx} className="group relative w-full flex justify-center h-full items-end">
                       {/* Tooltip Hover */}
                       <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20">
                         {prod.name}: {prod.quantity} ud.
                       </div>
                       {/* Barra con gradiente SPOT-ON */}
                       <div 
                         className="w-full bg-gradient-to-t from-sky-500 to-sky-400 group-hover:from-green-500 group-hover:to-green-400 rounded-t-sm sm:rounded-t-md transition-all duration-300 cursor-pointer"
                         style={{ height: `${heightPct}%` }}
                       ></div>
                     </div>
                   );
                 })}
                 {barChartData.length === 0 && <div className="w-full text-center text-slate-400 self-center">No hay datos</div>}
              </div>
            </div>
          </div>

          {/* GRÁFICO 2: Circular (Ocupa 1 columna) */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-full text-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Rentabilidad</h3>
              <p className="text-sm text-slate-500">Margen de Ganancia Estimado</p>
            </div>

            {/* Simulación Gráfico Circular con SVG */}
            <div className="relative w-48 h-48 mb-6">
               <svg viewBox="-2 -2 40 40" className="w-full h-full transform -rotate-90 drop-shadow-md">
                  {/* Círculo de Fondo (Costo) - Azul */}
                  <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#0ea5e9" strokeWidth="6"></circle>
                  {/* Círculo superpuesto (Ganancia) - Verde */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.91549430918954" 
                    fill="transparent" 
                    stroke="#22c55e" 
                    strokeWidth="6" 
                    strokeDasharray={`${pieChartData.profitPct} ${100 - pieChartData.profitPct}`} 
                    strokeDashoffset="0"
                    className="transition-all duration-1000 ease-out"
                  ></circle>
               </svg>
               {/* Centro del Donut */}
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-800">+{kpis.margin.toFixed(0)}%</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Margen</span>
               </div>
            </div>

            {/* Leyenda */}
            <div className="flex flex-col gap-3 w-full px-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span>
                     <span className="text-sm text-slate-600 font-medium">Ganancia Potencial</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{pieChartData.profitPct.toFixed(1)}%</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full bg-sky-500 shadow-sm"></span>
                     <span className="text-sm text-slate-600 font-medium">Costo Inventario</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{pieChartData.costPct.toFixed(1)}%</span>
               </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- ASISTENTE IA FLOTANTE (SPOT-ON WIDGET) --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Ventana de Chat (Aparece al hacer clic) */}
        {isAiOpen && (
          <div className="w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 mb-4 overflow-hidden animate-[slideUp_0.2s_ease-out] flex flex-col">
            {/* Header Chat */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between">
               <div className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-green-500 flex items-center justify-center">
                     <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Asistente SPOT-ON</h4>
                    <span className="text-xs text-sky-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> En línea
                    </span>
                  </div>
               </div>
               <button onClick={() => setIsAiOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            
            {/* Cuerpo Chat */}
            <div className="p-4 h-64 overflow-y-auto bg-slate-50 flex flex-col gap-3">
               <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 text-sm text-slate-600 self-start max-w-[85%]">
                 Hola, soy tu asistente de inventario. Viendo la <strong>{storeInfo.name}</strong>, noté que el margen proyectado es del {kpis.margin.toFixed(0)}%. ¿En qué te ayudo hoy?
               </div>
            </div>

            {/* Input Chat */}
            <div className="p-3 bg-white border-t border-slate-100">
               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Pregunta sobre tu inventario..." 
                   className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                 />
                 <button className="absolute right-1 top-1 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
                   <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* Botón Flotante Principal */}
        <button 
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={`group flex items-center gap-3 py-3 px-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${
            isAiOpen 
              ? 'bg-slate-800 text-white shadow-slate-900/20' 
              : 'bg-gradient-to-r from-sky-500 to-green-500 text-white shadow-sky-500/30'
          }`}
        >
          <div className="relative flex items-center justify-center">
            {/* Icono animado */}
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isAiOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              )}
            </svg>
          </div>
          {!isAiOpen && (
            <span className="font-semibold text-sm whitespace-nowrap overflow-hidden hidden sm:block">
              Asistente IA
            </span>
          )}
        </button>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Statistics;
