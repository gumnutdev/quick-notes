
import { Note } from '@/types/Note';
import { NoteCard } from './NoteCard';

interface SidebarProps {
  notes: Note[];
  activeNote: Note | null;
  onNoteSelect: (note: Note) => void;
  onNoteDelete: (noteId: string) => void;
}

export const Sidebar = ({ notes, activeNote, onNoteSelect, onNoteDelete }: SidebarProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {notes.length === 0 ? (
        <div className="text-center text-slate-400 mt-8">
          <p>No notes yet</p>
        </div>
      ) : (
        notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isActive={activeNote?.id === note.id}
            onClick={() => onNoteSelect(note)}
            onDelete={() => onNoteDelete(note.id)}
          />
        ))
      )}
    </div>
  );
};
