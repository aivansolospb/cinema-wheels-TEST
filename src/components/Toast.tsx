
import React from 'react';
import { Toast as ToastType } from '../types';

interface ToastProps {
    toast: ToastType | null;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
    if (!toast) return null;

    const baseClasses = "fixed bottom-5 left-1/2 -translate-x-1/2 z-50 py-3 px-5 rounded-lg shadow-lg text-white text-sm text-center max-w-[90%]";
    const typeClasses = toast.type === 'success' ? 'bg-tg-success' : 'bg-tg-error';

    return (
        <div className={`${baseClasses} ${typeClasses} animate-slideInUp`}>
            {toast.message}
        </div>
    );
};

export default Toast;