
import { useState, useEffect } from 'react';
import { Note, NoteLink } from '@/types/Note';
import { Calendar, Mood, Priority, Category, Status, LinkedNotes } from './NoteFields';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface NoteEditorProps {
  note: Note;
  onNoteUpdate: (note: Note) => void;
  allNotes: Note[];
}

export const NoteEditor = ({ note, onNoteUpdate, allNotes }: NoteEditorProps) => {
  const [localNote, setLocalNote] = useState<Note>(note);

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  const handleUpdate = (updates: Partial<Note>) => {
    const updatedNote = { ...localNote, ...updates };
    setLocalNote(updatedNote);
    onNoteUpdate(updatedNote);
  };

  const availableNotesToLink = allNotes
    .filter(n => n.id !== note.id)
    .map(n => ({ id: n.id, title: n.title }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
        <Input
          value={localNote.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          className="text-2xl font-bold bg-transparent border-none p-0 text-white placeholder-slate-400 focus:ring-0 focus:border-none"
          placeholder="Note title..."
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Textarea
            value={localNote.content}
            onChange={(e) => handleUpdate({ content: e.target.value })}
            placeholder="Start writing your note..."
            className="min-h-[400px] bg-transparent border-none p-0 text-white placeholder-slate-400 resize-none focus:ring-0 focus:border-none"
          />
        </div>

        {/* Sidebar with fields */}
        <div className="w-80 bg-slate-800/30 border-l border-slate-700/50 p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Note Properties</h3>
            
            <div className="space-y-4">
              <Calendar 
                createdDate={localNote.createdDate}
                modifiedDate={localNote.modifiedDate}
              />
              
              <Mood 
                value={localNote.mood}
                onChange={(mood) => handleUpdate({ mood })}
              />
              
              <Priority 
                value={localNote.priority}
                onChange={(priority) => handleUpdate({ priority })}
              />
              
              <Category 
                value={localNote.category}
                onChange={(category) => handleUpdate({ category })}
              />
              
              <Status 
                value={localNote.status}
                onChange={(status) => handleUpdate({ status })}
              />
              
              <LinkedNotes 
                linkedNoteIds={localNote.linkedNotes}
                availableNotes={availableNotesToLink}
                onChange={(linkedNotes) => handleUpdate({ linkedNotes })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
