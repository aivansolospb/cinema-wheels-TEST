
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    onConfirm?: () => void;
    cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, confirmText = "Confirm", onConfirm, cancelText = "Cancel" }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-md p-6 mx-auto bg-tg-bg rounded-xl shadow-lg flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-semibold text-center text-tg-text">{title}</h2>
                <div className="text-sm text-tg-text whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto">
                    {children}
                </div>
                <div className="flex gap-3 mt-4">
                    <button 
                        onClick={onClose} 
                        className="flex-1 px-4 py-2 text-sm font-medium bg-tg-secondary-bg text-tg-link rounded-lg focus:outline-none"
                    >
                        {cancelText}
                    </button>
                    {onConfirm && (
                        <button 
                            onClick={onConfirm} 
                            className="flex-1 px-4 py-2 text-sm font-medium text-tg-button-text bg-tg-button rounded-lg focus:outline-none"
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;