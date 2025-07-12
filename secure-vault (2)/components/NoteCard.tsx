
import React from 'react';
import { Note } from '../types';
import { EyeIcon, TrashIcon } from './Icons';

interface NoteCardProps {
    note: Note;
    onView: () => void;
    onDelete: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onView, onDelete }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to permanently delete this note?')) {
            onDelete();
        }
    };

    return (
        <div 
            className="group bg-gray-800 rounded-lg p-5 flex flex-col justify-between hover:bg-gray-700/80 hover:border-blue-500 border border-transparent transition-all duration-300 cursor-pointer"
            onClick={onView}
        >
            <div>
                <h3 className="font-bold text-lg truncate text-white">{note.title}</h3>
                <p className="text-sm text-gray-400 mt-2 line-clamp-3 h-[60px]">
                    {note.content}
                </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onView} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400">
                        <EyeIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-500/20 text-red-400">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
