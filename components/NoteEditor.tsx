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
import { Save, Check, AlertCircle, Menu, ArrowLeft } from "lucide-react";
import { useSaveNote } from "@/hooks/use-notes-api";
import { toast } from "sonner";

interface NoteEditorProps {
  note: Note;
  onNoteUpdate: (note: Note) => void;
  allNotes: Note[];
  onMobileBack?: () => void;
}

export const NoteEditor = ({
  note,
  onNoteUpdate,
  allNotes,
  onMobileBack,
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
  };

  const handleSave = async () => {
    try {
      await saveNoteMutation.mutateAsync(localNote);
      setHasUnsavedChanges(false);
      onNoteUpdate(localNote); // Update parent component only when successfully saved
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
      {/* Mobile Navigation - Only visible on mobile */}
      {onMobileBack && (
        <div className="md:hidden p-3 bg-slate-900/50 border-b border-slate-700/50 flex items-center">
          <Button
            onClick={onMobileBack}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700/50 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="ml-2 text-sm text-slate-300">Back to Notes</span>
        </div>
      )}

      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
          <Input
            value={localNote.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className="text-xl md:text-2xl font-bold bg-transparent border-none p-0 text-white placeholder-slate-400 focus:ring-0 focus:border-none flex-1 sm:mr-4"
            placeholder="Note title..."
          />
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saveNoteMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:opacity-50 w-full sm:w-auto"
          >
            {saveNoteMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : hasUnsavedChanges ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Save Note</span>
                <span className="sm:hidden">Save</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Saved</span>
                <span className="sm:hidden">Saved</span>
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
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <Textarea
              value={localNote.content}
              onChange={(e) => handleUpdate({ content: e.target.value })}
              placeholder="Start writing your note..."
              className="min-h-[400px] md:min-h-[400px] bg-transparent border-none p-0 text-white placeholder-slate-400 resize-none focus:ring-0 focus:border-none w-full"
            />
          </div>

          {/* Mobile Note Properties - Only visible on mobile */}
          <div className="md:hidden p-4 pt-0 space-y-6">
            <div className="border-t border-slate-700/50 pt-6">
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

        {/* Desktop Sidebar with fields */}
        <div className="hidden md:block w-80 bg-slate-800/30 border-l border-slate-700/50 p-6 overflow-y-auto space-y-6">
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
