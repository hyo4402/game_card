import React from 'react';
import { playSound, vibrate } from '../utils/audio';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<Props> = ({ children, variant = 'primary', fullWidth, className = '', onClick, ...props }) => {
  const base = "px-4 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center";
  const styles = {
    primary: "bg-tet-red text-white shadow-lg shadow-red-200/50 dark:shadow-none",
    secondary: "bg-tet-gold text-white shadow-lg shadow-yellow-200/50 dark:shadow-none",
    danger: "bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400",
    outline: "border-2 border-gray-200 text-gray-700 bg-white dark:bg-dark-card dark:border-gray-700 dark:text-gray-200"
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={(e) => { playSound('click'); vibrate(); onClick && onClick(e); }}
      {...props}
    >
      {children}
    </button>
  );
};