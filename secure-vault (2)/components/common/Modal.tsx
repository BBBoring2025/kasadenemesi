
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
    const modalRoot = document.body;

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={handleBackdropClick}
        >
            {children}
        </div>,
        modalRoot
    );
};
