import sqlite3 from "sqlite3";
import path from "path";
import { Note } from "@/types/Note";
import { promisify } from "util";

// Create database connection
const dbPath = path.join(process.cwd(), "notes.db");
const db = new sqlite3.Database(dbPath);

// Promisify database methods for async/await with proper typing
const dbRun = promisify<string, any[], sqlite3.Statement>(db.run.bind(db));
const dbGet = promisify<string, any[], any>(db.get.bind(db));
const dbAll = promisify<string, any[], any[]>(db.all.bind(db));

// Initialize database schema
export async function initializeDatabase() {
  // Create notes table if it doesn't exist
  const createNotesTable = `
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_date DATETIME NOT NULL,
      modified_date DATETIME NOT NULL,
      mood INTEGER NOT NULL DEFAULT 5,
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft'
    )
  `;

  // Create linked_notes table for note relationships
  const createLinkedNotesTable = `
    CREATE TABLE IF NOT EXISTS linked_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id TEXT NOT NULL,
      linked_note_id TEXT NOT NULL,
      FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
      FOREIGN KEY (linked_note_id) REFERENCES notes (id) ON DELETE CASCADE,
      UNIQUE(note_id, linked_note_id)
    )
  `;

  await dbRun(createNotesTable, []);
  await dbRun(createLinkedNotesTable, []);
}

// Database operations
export const noteOperations = {
  // Get all notes with their linked notes
  getAllNotes: async (): Promise<Note[]> => {
    const notesQuery = `
      SELECT * FROM notes 
      ORDER BY modified_date DESC
    `;

    const linkedNotesQuery = `
      SELECT note_id, linked_note_id 
      FROM linked_notes
    `;

    const notes: any[] = await dbAll(notesQuery, []);
    const linkedNotes: any[] = await dbAll(linkedNotesQuery, []);

    // Group linked notes by note_id
    const linkedNotesMap = new Map<string, string[]>();
    linkedNotes.forEach(({ note_id, linked_note_id }) => {
      if (!linkedNotesMap.has(note_id)) {
        linkedNotesMap.set(note_id, []);
      }
      linkedNotesMap.get(note_id)!.push(linked_note_id);
    });

    // Transform database results to Note objects
    return notes.map((note) => ({
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
    })) as Note[];
  },

  // Get a single note by ID
  getNoteById: async (id: string): Promise<Note | null> => {
    const noteQuery = `
      SELECT * FROM notes WHERE id = ?
    `;

    const linkedNotesQuery = `
      SELECT linked_note_id FROM linked_notes WHERE note_id = ?
    `;

    const note: any = await dbGet(noteQuery, [id]);
    if (!note) return null;

    const linkedNotes: any[] = await dbAll(linkedNotesQuery, [id]);

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
      linkedNotes: linkedNotes.map((ln) => ln.linked_note_id),
    } as Note;
  },

  // Save or update a note
  saveNote: async (note: Note): Promise<void> => {
    // Use a transaction-like approach with serialize
    return new Promise((resolve, reject) => {
      db.serialize(async () => {
        try {
          // Insert or update the note
          const upsertNoteQuery = `
            INSERT OR REPLACE INTO notes (
              id, title, content, created_date, modified_date, 
              mood, priority, category, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          await dbRun(upsertNoteQuery, [
            note.id,
            note.title,
            note.content,
            note.createdDate.toISOString(),
            note.modifiedDate.toISOString(),
            note.mood,
            note.priority,
            note.category,
            note.status,
          ]);

          // Delete existing linked notes for this note
          await dbRun("DELETE FROM linked_notes WHERE note_id = ?", [note.id]);

          // Insert new linked notes
          if (note.linkedNotes && note.linkedNotes.length > 0) {
            const insertLinkedNoteQuery = `
              INSERT INTO linked_notes (note_id, linked_note_id) VALUES (?, ?)
            `;

            for (const linkedNoteId of note.linkedNotes) {
              await dbRun(insertLinkedNoteQuery, [note.id, linkedNoteId]);
            }
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  },

  // Delete a note and its relationships
  deleteNote: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.serialize(async () => {
        try {
          // Delete linked notes relationships
          await dbRun(
            "DELETE FROM linked_notes WHERE note_id = ? OR linked_note_id = ?",
            [id, id]
          );

          // Delete the note
          await dbRun("DELETE FROM notes WHERE id = ?", [id]);

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  },
};

// Initialize database on import
initializeDatabase().catch(console.error);

export default db;
