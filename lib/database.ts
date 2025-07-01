import { join } from "path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { Note } from "@/types/Note";

// Database schema
interface DatabaseSchema {
  notes: Array<{
    id: string;
    title: string;
    content: string;
    created_date: string;
    modified_date: string;
    mood: number;
    priority: string;
    category: string;
    status: string;
  }>;
  linked_notes: Array<{
    note_id: string;
    linked_note_id: string;
  }>;
}

// Database instance
let db: Low<DatabaseSchema> | null = null;

// Initialize database
async function initDatabase(): Promise<Low<DatabaseSchema>> {
  if (db) return db;

  // Database file path
  const file = join(process.cwd(), "notes.json");

  // Configure lowdb to write to JSON file
  const adapter = new JSONFile<DatabaseSchema>(file);
  db = new Low(adapter, { notes: [], linked_notes: [] });

  // Read existing data from file
  await db.read();

  // If file doesn't exist, write default data
  if (!db.data) {
    db.data = { notes: [], linked_notes: [] };
    await db.write();
  }

  return db;
}

// Initialize database schema (for compatibility)
export async function initializeDatabase() {
  await initDatabase();
  // No schema creation needed for lowdb - it's just JSON
}

// Database operations
export const noteOperations = {
  // Get all notes with their linked notes
  getAllNotes: async (): Promise<Note[]> => {
    const database = await initDatabase();

    const notes = database.data.notes;
    const linkedNotes = database.data.linked_notes;

    // Group linked notes by note_id
    const linkedNotesMap = new Map<string, string[]>();
    linkedNotes.forEach(({ note_id, linked_note_id }) => {
      if (!linkedNotesMap.has(note_id)) {
        linkedNotesMap.set(note_id, []);
      }
      linkedNotesMap.get(note_id)!.push(linked_note_id);
    });

    // Transform database results to Note objects
    return notes
      .map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        createdDate: new Date(note.created_date),
        modifiedDate: new Date(note.modified_date),
        mood: note.mood,
        priority: note.priority,
        category: note.category,
        status: note.status,
        linkedNotes: linkedNotesMap.get(note.id) || [],
      }))
      .sort(
        (a, b) => b.modifiedDate.getTime() - a.modifiedDate.getTime()
      ) as Note[];
  },

  // Get a single note by ID
  getNoteById: async (id: string): Promise<Note | null> => {
    const database = await initDatabase();

    const note = database.data.notes.find((n) => n.id === id);
    if (!note) return null;

    const linkedNotes = database.data.linked_notes
      .filter((ln) => ln.note_id === id)
      .map((ln) => ln.linked_note_id);

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      createdDate: new Date(note.created_date),
      modifiedDate: new Date(note.modified_date),
      mood: note.mood,
      priority: note.priority,
      category: note.category,
      status: note.status,
      linkedNotes,
    } as Note;
  },

  // Save or update a note
  saveNote: async (note: Note): Promise<void> => {
    const database = await initDatabase();

    // Remove existing note if it exists
    const existingIndex = database.data.notes.findIndex(
      (n) => n.id === note.id
    );
    if (existingIndex >= 0) {
      database.data.notes.splice(existingIndex, 1);
    }

    // Add the note
    database.data.notes.push({
      id: note.id,
      title: note.title,
      content: note.content,
      created_date: note.createdDate.toISOString(),
      modified_date: note.modifiedDate.toISOString(),
      mood: note.mood,
      priority: note.priority,
      category: note.category,
      status: note.status,
    });

    // Remove existing linked notes for this note
    database.data.linked_notes = database.data.linked_notes.filter(
      (ln) => ln.note_id !== note.id
    );

    // Add new linked notes
    if (note.linkedNotes && note.linkedNotes.length > 0) {
      for (const linkedNoteId of note.linkedNotes) {
        database.data.linked_notes.push({
          note_id: note.id,
          linked_note_id: linkedNoteId,
        });
      }
    }

    // Save to file
    await database.write();
  },

  // Delete a note and its relationships
  deleteNote: async (id: string): Promise<void> => {
    const database = await initDatabase();

    // Remove the note
    database.data.notes = database.data.notes.filter((n) => n.id !== id);

    // Remove all linked note relationships
    database.data.linked_notes = database.data.linked_notes.filter(
      (ln) => ln.note_id !== id && ln.linked_note_id !== id
    );

    // Save to file
    await database.write();
  },
};

// Initialize database on import
initializeDatabase().catch(console.error);

// Export for compatibility
export default null;
