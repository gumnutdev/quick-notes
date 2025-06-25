import { useState, useEffect } from "react";
import { Note, NoteLink } from "@/types/Note";
import {
  Calendar,
  Mood,
  Priority,
  Category,
  Status,
  LinkedNotes,
} from "./NoteFields";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Check, AlertCircle } from "lucide-react";
import { useSaveNote } from "@/hooks/use-notes-api";
import { toast } from "sonner";

interface NoteEditorProps {
  note: Note;
  onNoteUpdate: (note: Note) => void;
  allNotes: Note[];
}

export const NoteEditor = ({
  note,
  onNoteUpdate,
  allNotes,
}: NoteEditorProps) => {
  const [localNote, setLocalNote] = useState<Note>(note);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveNoteMutation = useSaveNote();

  useEffect(() => {
    setLocalNote(note);
    if (localNote.id !== note.id) {
      setHasUnsavedChanges(false);
    }
  }, [note, localNote.id]);

  const handleUpdate = (updates: Partial<Note>) => {
    const updatedNote = { ...localNote, ...updates, modifiedDate: new Date() };
    setLocalNote(updatedNote);
    setHasUnsavedChanges(true);
    onNoteUpdate(updatedNote);
  };

  const handleSave = async () => {
    try {
      await saveNoteMutation.mutateAsync(localNote);
      setHasUnsavedChanges(false);
      toast.success("Note saved successfully!");
    } catch (error) {
      toast.error("Failed to save note: " + (error as Error).message);
    }
  };

  const availableNotesToLink = allNotes
    .filter((n) => n.id !== note.id)
    .map((n) => ({ id: n.id, title: n.title }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center justify-between">
          <Input
            value={localNote.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className="text-2xl font-bold bg-transparent border-none p-0 text-white placeholder-slate-400 focus:ring-0 focus:border-none flex-1 mr-4"
            placeholder="Note title..."
          />
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saveNoteMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:opacity-50"
          >
            {saveNoteMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : hasUnsavedChanges ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved
              </>
            )}
          </Button>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center mt-2 text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            You have unsaved changes
          </div>
        )}
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
            <h3 className="text-lg font-semibold text-white mb-4">
              Note Properties
            </h3>

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
