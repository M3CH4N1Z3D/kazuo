import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import SpotOnAlert, { AlertVariant } from '@/components/SpotOnAlert';

export interface AlertOptions {
  title: string;
  message?: React.ReactNode;
  variant?: AlertVariant;
  confirmText?: string;
  cancelText?: string;
  denyText?: string;
  showCancelButton?: boolean;
  showDenyButton?: boolean;
  input?: 'text' | 'number' | 'email';
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValidator?: (value: string) => string | undefined | Promise<string | undefined>;
}

export interface AlertResult {
  isConfirmed: boolean;
  isDenied: boolean;
  isDismissed: boolean;
  value?: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => Promise<AlertResult>;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    variant: AlertVariant;
    confirmText?: string;
    cancelText?: string;
    denyText?: string;
    showCancelButton?: boolean;
    showDenyButton?: boolean;
    onConfirm: (value?: string) => void;
    onDeny: () => void;
    onClose: () => void;
    isLoading?: boolean;
    input?: 'text' | 'number' | 'email';
    inputLabel?: string;
    inputPlaceholder?: string;
    inputValidator?: (value: string) => string | undefined | Promise<string | undefined>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    onConfirm: () => {},
    onDeny: () => {},
    onClose: () => {},
  });

  const showAlert = useCallback((options: AlertOptions): Promise<AlertResult> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        title: options.title,
        message: options.message || '',
        variant: options.variant || 'warning',
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        denyText: options.denyText,
        showCancelButton: options.showCancelButton ?? true,
        showDenyButton: options.showDenyButton ?? false,
        isLoading: false,
        input: options.input,
        inputLabel: options.inputLabel,
        inputPlaceholder: options.inputPlaceholder,
        inputValidator: options.inputValidator,
        onConfirm: (value?: string) => {
          setAlertState((prev) => ({ ...prev, isOpen: false }));
          resolve({ isConfirmed: true, isDenied: false, isDismissed: false, value });
        },
        onDeny: () => {
          setAlertState((prev) => ({ ...prev, isOpen: false }));
          resolve({ isConfirmed: false, isDenied: true, isDismissed: false });
        },
        onClose: () => {
          setAlertState((prev) => ({ ...prev, isOpen: false }));
          resolve({ isConfirmed: false, isDenied: false, isDismissed: true });
        },
      });
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      <SpotOnAlert
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        denyText={alertState.denyText}
        showCancelButton={alertState.showCancelButton}
        showDenyButton={alertState.showDenyButton}
        onConfirm={alertState.onConfirm}
        onDeny={alertState.onDeny}
        onClose={alertState.onClose}
        isLoading={alertState.isLoading}
        input={alertState.input}
        inputLabel={alertState.inputLabel}
        inputPlaceholder={alertState.inputPlaceholder}
        inputValidator={alertState.inputValidator}
      />
    </AlertContext.Provider>
  );
};
