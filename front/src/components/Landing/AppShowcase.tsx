"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { LayoutDashboard, Building, User, Menu, LogOut, Package } from 'lucide-react';

const inventoryData = [
  { name: 'Camisas', quantity: 45 },
  { name: 'Pantalones', quantity: 32 },
  { name: 'Zapatos', quantity: 18 },
  { name: 'Accesorios', quantity: 56 },
  { name: 'Chaquetas', quantity: 12 },
];

const profitData = [
  { name: 'Costo Total', value: 3500 },
  { name: 'Ventas Totales', value: 8200 },
  { name: 'Ganancias', value: 4700 },
];

const COLORS = ['#ef4444', '#3b82f6', '#10b981']; 

export default function AppShowcase() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setMounted(true);
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('es-ES', options));
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full max-w-5xl mx-auto perspective-1000">
      {/* Browser Frame */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all duration-500 hover:rotate-x-1 hover:scale-[1.01]">
        {/* Browser Header */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="ml-4 bg-white rounded-md px-3 py-1 text-xs text-gray-400 flex-1 max-w-xs flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             app.spot-on.com/statistics
          </div>
        </div>

        {/* App Content */}
        <div className="flex flex-col h-[500px] md:h-[600px] bg-white overflow-hidden">
          
          {/* Top Navbar (Real App Style) */}
          <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur flex h-16 items-center justify-between px-4 lg:px-6">
             <div className="flex items-center gap-4">
                {/* Mobile Menu Button Mock */}
                <button className="lg:hidden p-2 -ml-2 text-slate-500">
                   <Menu size={24} />
                </button>
                {/* Logo Area */}
                <div className="font-bold text-xl text-slate-900 flex items-center gap-2">
                   <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">S</div>
                   <span className="hidden sm:inline">Spot-On</span>
                </div>
             </div>

             {/* Desktop Nav Links */}
             <nav className="hidden lg:flex items-center space-x-1">
                <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 cursor-pointer">
                   <LayoutDashboard size={18} /> <span>Gestión Inventario</span>
                </div>
                <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 cursor-pointer">
                   <Building size={18} /> <span>Mi Empresa</span>
                </div>
                <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 cursor-pointer">
                   <User size={18} /> <span>Perfil</span>
                </div>
             </nav>

             {/* Right Actions */}
             <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 text-slate-500 text-sm font-medium cursor-pointer hover:text-red-500">
                   <LogOut size={18} /> <span>Salir</span>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm lg:hidden">
                   U
                </div>
             </div>
          </header>

          {/* Main Area (Mimicking Statistics.tsx) */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6 text-center md:text-left">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-700 uppercase">HISTORIA &quot;Mi Negocio&quot;</h1>
                  <p className="text-gray-500 mt-1 text-sm md:text-base">Fecha de reporte: <span className="capitalize">{currentDate}</span></p>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">DATOS DE INTERES</h2>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Inventory Chart */}
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-base md:text-lg font-medium text-gray-700 mb-4 text-center">Inventario de Productos</h3>
                    <div className="h-[250px] md:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                          <YAxis />
                          <Tooltip 
                            cursor={{fill: 'transparent'}} 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="quantity" name="Cantidad" fill="#c23531" radius={[4, 4, 0, 0]} animationDuration={2000} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Profits Chart */}
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-base md:text-lg font-medium text-gray-700 mb-1 text-center">Ganancias estimadas de bodega</h3>
                    <p className="text-xs text-gray-400 text-center mb-4">Costo de productos vs Venta de productos</p>
                    <div className="h-[250px] md:h-[300px] w-full flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={profitData}
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            animationDuration={2000}
                          >
                            {profitData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
          </main>
        </div>
      </div>
      
      {/* Decorative elements behind */}
      <div className="absolute -z-10 top-20 -right-12 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -z-10 -bottom-10 -left-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
  );
}

