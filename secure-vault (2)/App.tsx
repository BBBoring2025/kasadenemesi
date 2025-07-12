import React, { useState, useEffect } from 'react';
import { useVault } from './hooks/useVault';
import { LoginScreen } from './components/LoginScreen';
import { VaultScreen } from './components/VaultScreen';
import { ShieldAlertIcon } from './components/Icons';
import { useIdleLocker } from './hooks/useIdleLocker';

const IDLE_TIMEOUT_MINUTES = 15;

const App: React.FC = () => {
    const vault = useVault();
    const [isBlurred, setIsBlurred] = useState(false);

    // Auto-lock the vault after a period of inactivity
    useIdleLocker(vault.lock, IDLE_TIMEOUT_MINUTES * 60, !vault.isLocked);

    useEffect(() => {
        const handleBlur = () => setIsBlurred(true);
        const handleFocus = () => setIsBlurred(false);

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    return (
        <div className={`min-h-screen transition-filter duration-300 ${isBlurred ? 'blur-lg' : ''}`}>
            <main className="container mx-auto p-4 md:p-8">
                {vault.isLocked ? (
                    <LoginScreen vault={vault} />
                ) : (
                    <VaultScreen vault={vault} />
                )}
            </main>
            <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-3 border-t border-yellow-500/30">
                <div className="container mx-auto flex items-center justify-center text-xs text-yellow-400">
                    <ShieldAlertIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>
                        <strong>Security Notice:</strong> Data is encrypted in your browser. Security relies on your device's safety and a strong, unrecoverable master password.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default App;