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
import {
  useGumnutDoc,
  buildTestToken,
  GumnutText,
  GumnutFocus,
} from "@gumnutdev/react";

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

  const getToken = () =>
    buildTestToken(undefined, {
      name: "Owen Brasier",
      email: "owen@gumnut.dev",
      picture: "https://gumnut.dev/assets/flag-64-D70dGnzm.png",
    });
  const scope = useGumnutDoc({
    getToken,
    docId: `${note.id}-doc`,
  });

  useEffect(() => {
    setLocalNote(note);
    if (localNote.id !== note.id) {
      setHasUnsavedChanges(false);
    }
  }, [note, localNote.id]);

  useEffect(() => {
    const c = new AbortController();

    scope.doc.addListener(
      "agentAction",
      (m) => {
        toast(`Agent ${m.name}: ${m.message}`);
      },
      c.signal
    );

    return () => c.abort();
  });

  // Update Note object without triggering save state (for Gumnut sync)
  const updateNoteObject = (updates: Partial<Note>) => {
    const updatedNote = { ...localNote, ...updates, modifiedDate: new Date() };
    setLocalNote(updatedNote);
    setHasUnsavedChanges(true);
    onNoteUpdate(updatedNote);
  };

  // Update Note object and mark as having unsaved changes (for user actions)
  const handleUpdate = (updates: Partial<Note>) => {
    const updatedNote = { ...localNote, ...updates, modifiedDate: new Date() };
    setLocalNote(updatedNote);
    setHasUnsavedChanges(true);
    onNoteUpdate(updatedNote);
  };

  // Check if any Gumnut fields are dirty for save button state

  const handleSave = async () => {
    try {
      scope.actions.commit(async () => {
        await saveNoteMutation.mutateAsync(localNote);
        setHasUnsavedChanges(false);
        toast.success("Note saved successfully!");
      });
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
          <GumnutFocus control={scope.control} name="title" />
          <GumnutText
            control={scope.control}
            name="title"
            defaultValue={localNote.title}
            placeholder="Note title..."
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              color: "white",
              outline: "none",
              flex: "1",
              marginRight: "1rem",
            }}
            render={({ state, children }) => {
              // Update the Note object when Gumnut field changes (without triggering save)
              const currentValue =
                scope.doc?.root().value("title")?.contents() || "";
              if (currentValue !== localNote.title && currentValue !== "") {
                updateNoteObject({ title: currentValue });
              }
              return children;
            }}
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
          <GumnutFocus control={scope.control} name="content" />
          <GumnutText
            control={scope.control}
            name="content"
            multiline
            rows={10}
            resize={false}
            defaultValue={localNote.content}
            placeholder="Start writing your note..."
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              border: "0.5px solid",
              borderRadius: "8px",
              padding: "0",
              color: "white",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
            render={({ state, children }) => {
              // Update the Note object when Gumnut field changes (without triggering save)
              const currentValue =
                scope.doc?.root().value("content")?.contents() || "";
              if (currentValue !== localNote.content && currentValue !== "") {
                updateNoteObject({ content: currentValue });
              }
              return children;
            }}
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
                scope={scope}
                name="mood"
                value={localNote.mood}
                onChange={(mood) => handleUpdate({ mood })}
              />

              <Priority
                scope={scope}
                name="priority"
                value={localNote.priority}
                onChange={(priority) => handleUpdate({ priority })}
              />

              <Category
                scope={scope}
                name="category"
                value={localNote.category}
                onChange={(category) => handleUpdate({ category })}
              />

              <Status
                scope={scope}
                name="status"
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
