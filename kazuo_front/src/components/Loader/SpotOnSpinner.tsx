import React from 'react';

/**
 * Componente Spinner personalizado para SPOT-ON
 * * Props:
 * - size: 'sm' | 'md' | 'lg' | 'xl' (Por defecto 'md')
 * - text: string (Texto opcional para mostrar debajo del spinner)
 * - className: string (Clases adicionales de Tailwind)
 */
export const SpotOnSpinner = ({ 
  size = 'md', 
  text, 
  className = '' 
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}) => {
  // Mapeo de tamaños usando clases de Tailwind
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${sizeClasses[size] || sizeClasses.md} drop-shadow-md`}
        aria-label="Cargando..."
      >
        <defs>
          {/* Degradado principal de la marca SPOT-ON */}
          <linearGradient id="spotOnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" /> {/* sky-500 */}
            <stop offset="50%" stopColor="#10b981" /> {/* emerald-500 */}
            <stop offset="100%" stopColor="#22c55e" /> {/* green-500 */}
          </linearGradient>
        </defs>

        {/* --- ANILLO EXTERIOR: LA LUPA DE BÚSQUEDA --- */}
        {/* Rota en el sentido de las agujas del reloj */}
        <g className="animate-[spin_1.5s_linear_infinite]" style={{ transformOrigin: '50px 50px' }}>
          <circle
            cx="50"
            cy="50"
            r="36"
            stroke="url(#spotOnGradient)"
            strokeWidth="6"
            fill="none"
            strokeDasharray="160 66" /* Crea la forma incompleta para que parezca un loader */
            strokeLinecap="round"
          />
          {/* Mango de la lupa */}
          <line
            x1="75.5"
            y1="75.5"
            x2="92"
            y2="92"
            stroke="#22c55e"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>

        {/* --- ANILLO INTERIOR: EL OBJETIVO (TARGET) --- */}
        {/* Rota en sentido contrario a las agujas del reloj */}
        <g className="animate-[spin_3s_linear_infinite_reverse]" style={{ transformOrigin: '50px 50px' }}>
          <circle
            cx="50"
            cy="50"
            r="22"
            stroke="#0ea5e9"
            strokeWidth="3"
            fill="none"
            strokeDasharray="30 15"
            strokeLinecap="round"
            className="opacity-80"
          />
          {/* Mirillas (Crosshairs) del objetivo */}
          <line x1="50" y1="16" x2="50" y2="24" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="76" x2="50" y2="84" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="50" x2="24" y2="50" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
          <line x1="76" y1="50" x2="84" y2="50" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* --- NODO CENTRAL: IA Y CONEXIÓN --- */}
        {/* Un punto que pulsa simulando el procesamiento de IA */}
        <circle
          cx="50"
          cy="50"
          r="6"
          fill="url(#spotOnGradient)"
          className="animate-pulse"
          style={{ transformOrigin: '50px 50px' }}
        />
      </svg>

      {/* Texto opcional animado */}
      {text && (
        <span className="text-sm font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-green-500 animate-pulse uppercase">
          {text}
        </span>
      )}
    </div>
  );
};

export default SpotOnSpinner;
