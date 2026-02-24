import React, { useEffect, useState, useRef } from 'react';

export type AlertVariant = 'warning' | 'danger' | 'success' | 'info' | 'brand';

export interface SpotOnAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (value?: string) => void;
  onDeny?: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  denyText?: string;
  variant?: AlertVariant;
  isLoading?: boolean;
  showCancelButton?: boolean;
  showDenyButton?: boolean;
  input?: 'text' | 'number' | 'email';
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValidator?: (value: string) => string | undefined | Promise<string | undefined>;
}

/**
 * COMPONENTE REUTILIZABLE: SpotOnAlert
 */
const SpotOnAlert: React.FC<SpotOnAlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onDeny,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  denyText = 'Rechazar',
  variant = 'warning',
  isLoading = false,
  showCancelButton = true,
  showDenyButton = false,
  input,
  inputLabel,
  inputPlaceholder,
  inputValidator,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError(undefined);
      // Focus input if present
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Manejar el cierre con la tecla Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleConfirm = async () => {
    if (input) {
      if (inputValidator) {
        const validationError = await inputValidator(inputValue);
        if (validationError) {
          setError(validationError);
          return;
        }
      }
      onConfirm?.(inputValue);
    } else {
      onConfirm?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleConfirm();
      }
  }

  if (!isOpen) return null;

  // Configuración de estilos e íconos según la variante
  const variantStyles = {
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBtn: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      confirmBtn: 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    info: {
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    brand: {
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-500',
      confirmBtn: 'bg-gradient-to-r from-sky-500 to-green-500 hover:shadow-lg hover:shadow-sky-500/30 text-white',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="url(#gradientIcon)" strokeWidth={2}>
           <defs>
            <linearGradient id="gradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    }
  };

  const activeStyle = variantStyles[variant] || variantStyles.warning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4">
      {/* Fondo oscuro con desenfoque */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]" 
        onClick={!isLoading ? onClose : undefined}
      ></div>

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 transform transition-all animate-[scaleIn_0.2s_ease-out]">
        
        {/* Ícono */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${activeStyle.iconBg} ${activeStyle.iconColor} ring-8 ring-white shadow-sm`}>
            {activeStyle.icon}
          </div>
        </div>

        {/* Textos */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            {title}
          </h3>
          <div className="text-slate-500 text-base leading-relaxed">
            {message}
          </div>
        </div>

        {/* Input Field */}
        {input && (
          <div className="mb-6">
            {inputLabel && (
              <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
                {inputLabel}
              </label>
            )}
            <input
              ref={inputRef}
              type={input}
              value={inputValue}
              onChange={(e) => {
                  setInputValue(e.target.value);
                  setError(undefined);
              }}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:ring-4 focus:ring-sky-100 focus:border-sky-500'} outline-none transition-all text-slate-700`}
            />
            {error && (
              <p className="mt-2 text-sm text-red-500 text-left">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {showCancelButton && (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 focus:ring-4 focus:ring-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
            )}
            
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`${!showCancelButton ? 'w-full' : 'w-full sm:w-1/2'} py-3 px-4 rounded-xl font-semibold shadow-sm focus:ring-4 focus:outline-none transition-all flex items-center justify-center ${activeStyle.confirmBtn} disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : null}
              {isLoading ? 'Procesando...' : confirmText}
            </button>
          </div>
          {showDenyButton && (
             <button
                type="button"
                onClick={onDeny}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-slate-600 hover:bg-slate-700 focus:ring-4 focus:ring-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {denyText}
              </button>
          )}
        </div>
      </div>

      {/* Estilos de animación en línea para asegurar que funcionen en el preview */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { 
          from { opacity: 0; transform: scale(0.95) translateY(10px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
      `}</style>
    </div>
  );
};

export default SpotOnAlert;
