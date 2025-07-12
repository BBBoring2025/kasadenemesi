import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { Modal } from './common/Modal';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { CheckIcon, XIcon, CopyIcon, ClipboardCheckIcon } from './Icons';

interface NoteModalProps {
    note: Note | null;
    onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onClose: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({ note, onSave, onClose }) => {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [isCopied, setIsCopied] = useState(false);
    
    const copyIconTimeoutRef = useRef<number | null>(null);
    const clipboardClearTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // Cleanup timeouts on unmount
        return () => {
            if (copyIconTimeoutRef.current) clearTimeout(copyIconTimeoutRef.current);
            if (clipboardClearTimeoutRef.current) clearTimeout(clipboardClearTimeoutRef.current);
        };
    }, []);


    const handleSave = () => {
        if (title.trim()) {
            onSave({ title, content });
        }
    };

    const handleCopyContent = () => {
        if (!content || isCopied) return;

        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
            
            copyIconTimeoutRef.current = window.setTimeout(() => {
                setIsCopied(false);
            }, 3000);

            clipboardClearTimeoutRef.current = window.setTimeout(() => {
                // Clear clipboard by writing a harmless space
                navigator.clipboard.writeText(' ').catch(err => console.error("Could not clear clipboard", err));
            }, 30000); // 30 seconds
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    return (
        <Modal onClose={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-blue-500/30">
                <h2 className="text-2xl font-bold mb-4 text-white">{note ? 'Edit Note' : 'Create Note'}</h2>
                <div className="space-y-4">
                    <Input
                        placeholder="Note Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg"
                    />
                    <div className="relative">
                        <textarea
                            placeholder="Your secure content..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-64 p-3 pr-12 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-200 resize-y"
                        />
                        <button 
                            onClick={handleCopyContent} 
                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
                            aria-label={isCopied ? "Content copied" : "Copy content"}
                            title={isCopied ? "Copied! Clipboard will clear in 30s." : "Copy to clipboard"}
                        >
                           {isCopied ? <ClipboardCheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={onClose} variant="secondary">
                         <XIcon className="w-5 h-5 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={handleSave} variant="primary">
                        <CheckIcon className="w-5 h-5 mr-2" />
                        Save
                    </Button>
                </div>
            </div>
        </Modal>
    );
};