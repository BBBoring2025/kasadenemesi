
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
    const baseClasses = "w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-500 text-white";
    
    return (
        <input
            className={`${baseClasses} ${className}`}
            {...props}
        />
    );
};
