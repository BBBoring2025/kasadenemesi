
import React, { useState } from 'react';
import { VaultHook } from '../hooks/useVault';
import { Note } from '../types';
import { NoteCard } from './NoteCard';
import { NoteModal } from './NoteModal';
import { Button } from './common/Button';
import { PlusIcon, LockIcon } from './Icons';

interface VaultScreenProps {
    vault: VaultHook;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({ vault }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    const handleOpenModal = (note: Note | null = null) => {
        setSelectedNote(note);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedNote(null);
    };

    const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (selectedNote) {
            vault.updateNote({ ...selectedNote, ...noteData });
        } else {
            vault.addNote(noteData);
        }
        handleCloseModal();
    };

    return (
        <div className="animate-fade-in">
            <header className="flex items-center justify-between pb-4 mb-6 border-b border-gray-700">
                <h1 className="text-3xl font-bold text-white">My Vault</h1>
                <div className="flex items-center gap-4">
                    <Button onClick={() => handleOpenModal(null)} variant="primary">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        New Note
                    </Button>
                    <Button onClick={vault.lock} variant="danger">
                        <LockIcon className="w-5 h-5 mr-2" />
                        Lock Vault
                    </Button>
                </div>
            </header>

            {vault.notes.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {vault.notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(note => (
                        <NoteCard 
                            key={note.id} 
                            note={note} 
                            onView={() => handleOpenModal(note)}
                            onDelete={() => vault.deleteNote(note.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <p className="text-lg">Your vault is empty.</p>
                    <p>Click "New Note" to add your first secure item.</p>
                </div>
            )}

            {isModalOpen && (
                <NoteModal
                    note={selectedNote}
                    onSave={handleSaveNote}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};
