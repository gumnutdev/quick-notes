"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { SearchBar } from "@/components/SearchBar";
import { MindMapView } from "@/components/MindMapView";
import { Note } from "@/types/Note";
import { PlusCircle, Grid, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes, useSaveNote } from "@/hooks/use-notes-api";
import { toast } from "sonner";

export default function Home() {
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "mindmap">("list");
  const [isHydrated, setIsHydrated] = useState(false);

  const { data: databaseNotes, isLoading, error, refetch } = useNotes();
  const saveNoteMutation = useSaveNote();

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Always use database notes
  const notes = databaseNotes || [];

  // Set active note when database notes load
  useEffect(() => {
    if (databaseNotes && databaseNotes.length > 0 && !activeNote) {
      setActiveNote(databaseNotes[0]);
    }
  }, [databaseNotes, activeNote]);

  const createNewNote = async () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "Untitled Note",
      content: "",
      createdDate: new Date(),
      modifiedDate: new Date(),
      mood: 5,
      priority: "medium",
      category: "",
      status: "draft",
      linkedNotes: [],
    };

    try {
      await saveNoteMutation.mutateAsync(newNote);
      setActiveNote(newNote);
      toast.success("New note created!");
    } catch (error) {
      toast.error("Failed to create note: " + (error as Error).message);
    }
  };

  const updateNote = async (updatedNote: Note) => {
    try {
      await saveNoteMutation.mutateAsync(updatedNote);
      setActiveNote(updatedNote);
      // The query will automatically refetch and update the notes list
    } catch (error) {
      toast.error("Failed to save note: " + (error as Error).message);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete note");

      const remainingNotes = notes.filter((note: Note) => note.id !== noteId);
      setActiveNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
      refetch(); // Refresh the notes list
      toast.success("Note deleted!");
    } catch (error) {
      toast.error("Failed to delete note: " + (error as Error).message);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prevent hydration mismatch by showing loading state until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {viewMode === "list" && (
        <>
          {/* Sidebar */}
          <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-white">NotesVault</h1>
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setViewMode("mindmap")}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Map className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={createNewNote}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={saveNoteMutation.isPending}
                  >
                    {saveNoteMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <PlusCircle className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              {error && (
                <div className="mt-2 text-xs text-red-400">
                  ⚠ Database connection error
                </div>
              )}
            </div>

            <Sidebar
              notes={filteredNotes}
              activeNote={activeNote}
              onNoteSelect={setActiveNote}
              onNoteDelete={deleteNote}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {activeNote ? (
              <NoteEditor
                note={activeNote}
                onNoteUpdate={updateNote}
                allNotes={notes}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    Welcome to NotesVault
                  </h2>
                  <p className="text-slate-400 mb-6">
                    Create your first note to get started
                  </p>
                  <Button
                    onClick={createNewNote}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Note
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === "mindmap" && (
        <div className="flex-1 flex flex-col">
          {/* Mind Map Header */}
          <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setViewMode("list")}
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Grid className="w-4 h-4 mr-2" />
                List View
              </Button>
              <h1 className="text-xl font-bold text-white">Mind Map</h1>
            </div>
            <Button
              onClick={createNewNote}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={saveNoteMutation.isPending}
            >
              {saveNoteMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <PlusCircle className="w-4 h-4 mr-2" />
              )}
              New Note
            </Button>
          </div>

          {/* Mind Map Content */}
          <div className="flex-1">
            <MindMapView
              notes={notes}
              onNoteUpdate={updateNote}
              onNoteSelect={setActiveNote}
              activeNote={activeNote}
            />
          </div>
        </div>
      )}
    </div>
  );
}
