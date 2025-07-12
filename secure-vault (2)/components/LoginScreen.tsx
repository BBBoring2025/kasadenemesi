import React, { useState } from 'react';
import { VaultHook } from '../hooks/useVault';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { LockIcon, EyeIcon, EyeOffIcon, AlertTriangleIcon } from './Icons';

interface LoginScreenProps {
    vault: VaultHook;
}

const PasswordStrengthMeter: React.FC<{ password?: string }> = ({ password = '' }) => {
    const checkStrength = () => {
        let score = 0;
        if (password.length >= 12) score++;
        if (password.length >= 16) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        return score;
    };

    const score = checkStrength();
    const width = (score / 5) * 100;
    const color = score < 3 ? 'bg-red-500' : score < 4 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${color}`} style={{ width: `${width}%` }}></div>
        </div>
    );
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ vault }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (vault.isInitialized) {
            vault.unlock(password);
        } else {
            if (password.length < 12) {
                setLocalError("Password must be at least 12 characters long.");
                return;
            }
            if (password !== confirmPassword) {
                setLocalError("Passwords do not match.");
                return;
            }
            vault.initializeVault(password);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-xl border border-blue-500/20">
                <div className="text-center">
                    <LockIcon className="w-16 h-16 mx-auto text-blue-400" />
                    <h1 className="mt-4 text-3xl font-bold text-white">Secure Vault</h1>
                    <p className="mt-2 text-sm text-gray-400">
                        {vault.isInitialized ? 'Enter your master password to unlock.' : 'Create a master password to secure your vault.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Master Password"
                                required
                                aria-label="Master Password"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        {!vault.isInitialized && <PasswordStrengthMeter password={password} />}
                    </div>

                    {!vault.isInitialized && (
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Master Password"
                            required
                            aria-label="Confirm Master Password"
                        />
                    )}
                    
                    <Button type="submit" className="w-full">
                        {vault.isInitialized ? 'Unlock Vault' : 'Create Vault'}
                    </Button>
                </form>

                {(localError || vault.error) && (
                    <p className="text-sm text-center text-red-400 animate-pulse">{localError || vault.error}</p>
                )}
                
                {!vault.isInitialized && (
                     <div className="flex items-start p-3 mt-4 text-xs text-orange-300 bg-orange-900/50 rounded-lg border border-orange-500/30">
                        <AlertTriangleIcon className="w-8 h-8 mr-2 flex-shrink-0" />
                        <div>
                            <strong>CRITICAL:</strong> Your password is the ONLY key to your vault. It is never stored or sent anywhere. If you forget it, your data will be permanently lost.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};