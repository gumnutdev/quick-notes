"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { SearchBar } from "@/components/SearchBar";
import { MindMapView } from "@/components/MindMapView";
import { Note } from "@/types/Note";
import { PlusCircle, Grid, Map, Database, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes, useSaveNote } from "@/hooks/use-notes-api";
import { toast } from "sonner";

export default function Home() {
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "mindmap">("list");
  const [dataSource, setDataSource] = useState<"local" | "database">(
    "database"
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const { data: databaseNotes, isLoading, error, refetch } = useNotes();
  const saveNoteMutation = useSaveNote();

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Choose data source
  const notes = dataSource === "database" ? databaseNotes || [] : localNotes;

  // Load notes from localStorage on mount (fallback)
  useEffect(() => {
    if (!isHydrated) return; // Prevent SSR issues

    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdDate: new Date(note.createdDate),
        modifiedDate: new Date(note.modifiedDate),
      }));
      setLocalNotes(parsedNotes);
      if (dataSource === "local" && parsedNotes.length > 0 && !activeNote) {
        setActiveNote(parsedNotes[0]);
      }
    }
  }, [dataSource, activeNote, isHydrated]);

  // Set active note when database notes load
  useEffect(() => {
    if (
      dataSource === "database" &&
      databaseNotes &&
      databaseNotes.length > 0 &&
      !activeNote
    ) {
      setActiveNote(databaseNotes[0]);
    }
  }, [databaseNotes, dataSource, activeNote]);

  // Save local notes to localStorage whenever they change
  useEffect(() => {
    if (!isHydrated) return; // Prevent SSR issues

    if (dataSource === "local") {
      localStorage.setItem("notes", JSON.stringify(localNotes));
    }
  }, [localNotes, dataSource, isHydrated]);

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

    if (dataSource === "database") {
      try {
        await saveNoteMutation.mutateAsync(newNote);
        setActiveNote(newNote);
        toast.success("New note created!");
      } catch (error) {
        toast.error("Failed to create note: " + (error as Error).message);
      }
    } else {
      setLocalNotes((prev: Note[]) => [newNote, ...prev]);
      setActiveNote(newNote);
    }
  };

  const updateNote = async (updatedNote: Note) => {
    if (dataSource === "database") {
      // Save to database and update local state
      try {
        await saveNoteMutation.mutateAsync(updatedNote);
        setActiveNote(updatedNote);
        // The query will automatically refetch and update the notes list
      } catch (error) {
        toast.error("Failed to save note: " + (error as Error).message);
      }
    } else {
      setLocalNotes((prev: Note[]) =>
        prev.map((note: Note) =>
          note.id === updatedNote.id
            ? { ...updatedNote, modifiedDate: new Date() }
            : note
        )
      );
      setActiveNote(updatedNote);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (dataSource === "database") {
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
    } else {
      setLocalNotes((prev: Note[]) =>
        prev.filter((note: Note) => note.id !== noteId)
      );
      if (activeNote?.id === noteId) {
        const remainingNotes = localNotes.filter(
          (note: Note) => note.id !== noteId
        );
        setActiveNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
      }
    }
  };

  const toggleDataSource = () => {
    setDataSource((prev) => (prev === "database" ? "local" : "database"));
    setActiveNote(null); // Reset active note when switching
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
                  <Button
                    onClick={toggleDataSource}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    title={`Switch to ${
                      dataSource === "database" ? "Local Storage" : "Database"
                    }`}
                  >
                    {dataSource === "database" ? (
                      <Database className="w-4 h-4" />
                    ) : (
                      <HardDrive className="w-4 h-4" />
                    )}
                  </Button>
                  {isLoading && dataSource === "database" && (
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
              <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>
                  Source:{" "}
                  {dataSource === "database"
                    ? "SQLite Database"
                    : "Local Storage"}
                </span>
                {error && dataSource === "database" && (
                  <span className="text-red-400">⚠ Database Error</span>
                )}
              </div>
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
              <Button
                onClick={toggleDataSource}
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                title={`Switch to ${
                  dataSource === "database" ? "Local Storage" : "Database"
                }`}
              >
                {dataSource === "database" ? (
                  <Database className="w-4 h-4" />
                ) : (
                  <HardDrive className="w-4 h-4" />
                )}
              </Button>
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
