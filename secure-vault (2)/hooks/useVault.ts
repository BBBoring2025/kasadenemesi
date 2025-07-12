import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { generateSalt, deriveKey, encrypt, decrypt } from '../services/cryptoService';

const VAULT_STORAGE_KEY = 'secureVaultData';
const SALT_STORAGE_KEY = 'secureVaultSalt';

type SessionKeys = { encKey: string; macKey: string };

export const useVault = () => {
    const [isLocked, setIsLocked] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [sessionKeys, setSessionKeys] = useState<SessionKeys | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const salt = localStorage.getItem(SALT_STORAGE_KEY);
        setIsInitialized(!!salt);
    }, []);

    const saveData = useCallback((notesData: Note[], keys: SessionKeys) => {
        const encryptedData = encrypt(JSON.stringify(notesData), keys.encKey, keys.macKey);
        localStorage.setItem(VAULT_STORAGE_KEY, encryptedData);
    }, []);

    const initializeVault = useCallback((password: string) => {
        setError(null);
        const salt = generateSalt();
        const keys = deriveKey(password, salt);
        localStorage.setItem(SALT_STORAGE_KEY, salt);
        setSessionKeys(keys);
        setNotes([]);
        saveData([], keys);
        setIsLocked(false);
        setIsInitialized(true);
    }, [saveData]);

    const unlock = useCallback((password: string) => {
        setError(null);
        const salt = localStorage.getItem(SALT_STORAGE_KEY);
        const encryptedData = localStorage.getItem(VAULT_STORAGE_KEY);

        if (!salt || !encryptedData) {
            setError("Vault not found or corrupt.");
            return;
        }

        const keys = deriveKey(password, salt);
        const decryptedData = decrypt(encryptedData, keys.encKey, keys.macKey);

        if (decryptedData) {
            setSessionKeys(keys);
            try {
                setNotes(JSON.parse(decryptedData));
            } catch {
                setError("Failed to parse vault data. It might be corrupt.");
                return;
            }
            setIsLocked(false);
        } else {
            setError("Invalid password. Please try again.");
        }
    }, []);

    const lock = useCallback(() => {
        setIsLocked(true);
        setSessionKeys(null);
        setNotes([]);
        setError(null);
    }, []);

    const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!sessionKeys) return;
        const newNote: Note = {
            ...noteData,
            id: new Date().toISOString() + Math.random(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        saveData(updatedNotes, sessionKeys);
    }, [notes, sessionKeys, saveData]);

    const updateNote = useCallback((updatedNote: Note) => {
        if (!sessionKeys) return;
        const updatedNotes = notes.map(n => n.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date().toISOString() } : n);
        setNotes(updatedNotes);
        saveData(updatedNotes, sessionKeys);
    }, [notes, sessionKeys, saveData]);

    const deleteNote = useCallback((noteId: string) => {
        if (!sessionKeys) return;
        const updatedNotes = notes.filter(n => n.id !== noteId);
        setNotes(updatedNotes);
        saveData(updatedNotes, sessionKeys);
    }, [notes, sessionKeys, saveData]);
    
    return { isLocked, isInitialized, notes, error, initializeVault, unlock, lock, addNote, updateNote, deleteNote };
};

export type VaultHook = ReturnType<typeof useVault>;