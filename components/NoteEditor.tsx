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
import {
  useGumnutDoc,
  buildTestToken,
  GumnutText,
  GumnutFocus,
  GumnutStatus,
} from "@gumnutdev/react";
import { GumnutTextProps } from "../../gumnut-react/dist/types/api/GumnutText";

interface NoteEditorProps {
  note: Note;
  onNoteUpdate: (note: Note) => void;
  allNotes: Note[];
  onMobileBack?: () => void;
}

let isHidden = false;
try {
  const u = new URL(window.location.href);
  isHidden = !u.searchParams.has("ai");
} catch {
  // server
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
    Promise.resolve().then(() => {
      const updatedNote = {
        ...localNote,
        ...updates,
        modifiedDate: new Date(),
      };
      setLocalNote(updatedNote);
      setHasUnsavedChanges(true);
      onNoteUpdate(updatedNote);
    });
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
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
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
                width: "100%",
                boxSizing: "border-box",
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
          </div>
          <div className="flex-1 min-w-0">
            <GumnutStatus />
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saveNoteMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:opacity-50 w-full sm:w-auto shrink-0"
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

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col">
          <GumnutFocus control={scope.control} name="content" />
          <GumnutText
            control={scope.control}
            name="content"
            multiline
            rows={10}
            resize={false}
            defaultValue={localNote.content}
            placeholder="Start writing your note..."
            className="flex-1 md:min-h-0"
            style={{
              width: "100%",
              minHeight: "300px",
              backgroundColor: "transparent",
              border: "0.5px solid",
              borderRadius: "8px",
              padding: "12px",
              color: "white",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "inherit",
              boxSizing: "border-box",
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

        {/* Note Properties - Mobile: below content, Desktop: sidebar */}
        <div className="w-full md:w-80 bg-slate-800/30 border-t md:border-t-0 md:border-l border-slate-700/50 p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Note Properties
            </h3>
            <div className="space-y-4">
              <div hidden={isHidden}>
                <Button
                  onClick={() => {
                    scope.doc.triggerAgent("OMdDJx40OmlgakWiB2BZpQ");
                  }}
                >
                  Make Sassy
                </Button>

                <Button
                  onClick={() => {
                    scope.doc.triggerAgent("UUsW_CZS3qWLw0Ehu6OlRQ");
                  }}
                >
                  Professional
                </Button>

                <Button
                  onClick={() => {
                    scope.doc.triggerAgent("Ke4IF8-boExlIYFx405O2g");
                  }}
                >
                  Summarize Title
                </Button>

                <Button
                  onClick={() => {
                    scope.doc.shutdownAgents();
                  }}
                >
                  Shut Down
                </Button>
              </div>

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
