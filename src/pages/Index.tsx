import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { SearchBar } from '@/components/SearchBar';
import { MindMapView } from '@/components/MindMapView';
import { Note } from '@/types/Note';
import { PlusCircle, Grid, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'mindmap'>('list');

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      setNotes(parsedNotes);
      if (parsedNotes.length > 0) {
        setActiveNote(parsedNotes[0]);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      createdDate: new Date(),
      modifiedDate: new Date(),
      mood: 5,
      priority: 'medium',
      category: '',
      status: 'draft',
      linkedNotes: []
    };
    
    setNotes(prev => [newNote, ...prev]);
    setActiveNote(newNote);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prev => 
      prev.map(note => 
        note.id === updatedNote.id 
          ? { ...updatedNote, modifiedDate: new Date() }
          : note
      )
    );
    setActiveNote(updatedNote);
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (activeNote?.id === noteId) {
      const remainingNotes = notes.filter(note => note.id !== noteId);
      setActiveNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {viewMode === 'list' && (
        <>
          {/* Sidebar */}
          <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-white">NotesVault</h1>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => setViewMode('mindmap')}
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
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
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
                  <Button onClick={createNewNote} className="bg-purple-600 hover:bg-purple-700">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Note
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'mindmap' && (
        <div className="flex-1 flex flex-col">
          {/* Mind Map Header */}
          <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setViewMode('list')}
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
            >
              <PlusCircle className="w-4 h-4 mr-2" />
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
};

export default Index;
