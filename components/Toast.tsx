
import React from 'react';
import { Toast as ToastType } from '../types';

interface ToastProps {
    toast: ToastType | null;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
    if (!toast) return null;

    const baseClasses = "fixed bottom-20 left-1/2 -translate-x-1/2 z-50 py-3 px-5 rounded-lg shadow-lg text-white text-sm text-center max-w-[90%] transition-all duration-300";
    const typeClasses = toast.type === 'success' ? 'bg-tg-success' : 'bg-tg-error';
    const visibilityClasses = toast ? 'opacity-100' : 'opacity-0';

    return (
        <div className={`${baseClasses} ${typeClasses} ${visibilityClasses}`}>
            {toast.message}
        </div>
    );
};

export default Toast;
